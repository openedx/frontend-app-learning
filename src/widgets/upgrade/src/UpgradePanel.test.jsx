import React from 'react';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  render, screen, act, waitFor, initializeMockApp,
} from '@src/setupTest';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import * as localStorageModule from '@src/data/localStorage';
import { useModel } from '@src/generic/model-store';
import { UpgradeWidgetProvider } from './UpgradeWidgetContext';
import UpgradePanel from './UpgradePanel';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(() => ({ administrator: false })),
}));

jest.mock('@src/data/localStorage', () => ({
  getLocalStorage: jest.fn(() => null),
  setLocalStorage: jest.fn(),
}));

jest.mock('@src/generic/model-store', () => ({
  useModel: jest.fn(),
}));

initializeMockApp();

const courseId = 'course-v1:edX+Test+2024';

function buildCoursewareMeta(overrides = {}) {
  return {
    end: null,
    enrollmentEnd: null,
    enrollmentMode: 'audit',
    enrollmentStart: null,
    start: null,
    verificationStatus: 'none',
    ...overrides,
  };
}

function buildCourseHomeMeta(overrides = {}) {
  return {
    courseModes: [],
    org: 'edX',
    verifiedMode: null,
    username: 'MockUser',
    isStaff: false,
    ...overrides,
  };
}

function renderPanel(contextOverrides = {}, modelOverrides = {}) {
  useModel.mockImplementation((modelType) => {
    if (modelType === 'coursewareMeta') {
      return buildCoursewareMeta(modelOverrides.coursewareMeta);
    }
    if (modelType === 'courseHomeMeta') {
      return buildCourseHomeMeta(modelOverrides.courseHomeMeta);
    }
    return {};
  });

  return render(
    <SidebarContext.Provider value={{
      courseId,
      shouldDisplayFullScreen: false,
      currentSidebar: 'UPGRADE',
      toggleSidebar: jest.fn(),
      ...contextOverrides,
    }}
    >
      <UpgradeWidgetProvider>
        <UpgradePanel />
      </UpgradeWidgetProvider>
    </SidebarContext.Provider>,
  );
}

describe('UpgradePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorageModule.getLocalStorage.mockReturnValue(null);
    getAuthenticatedUser.mockReturnValue({ administrator: false });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('sends the upgrade panel track event on mount', () => {
    renderPanel();

    expect(sendTrackEvent).toHaveBeenCalledWith(
      'edx.ui.course.upgrade.sidebar.upgrade.panel',
      expect.objectContaining({ courserun_key: courseId }),
    );
  });

  it('shows "no upgrade options" message when verifiedMode is null', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByText(/no upgrade options available/i)).toBeInTheDocument();
    });
  });

  it('renders inside a labeled sidebar section', () => {
    renderPanel();

    expect(screen.getByRole('region', { name: /upgrade panel/i })).toBeInTheDocument();
  });

  it('calls onUpgradeWidgetSeen (sets status inactive) after 3 seconds', async () => {
    renderPanel();
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(localStorageModule.setLocalStorage).toHaveBeenCalledWith(
        `upgradeWidget.${courseId}`,
        'inactive',
      );
    });
  });

  it('does not call onUpgradeWidgetSeen before 3 seconds have elapsed', () => {
    renderPanel();
    act(() => {
      jest.advanceTimersByTime(2999);
    });

    expect(localStorageModule.setLocalStorage).not.toHaveBeenCalledWith(
      `upgradeWidget.${courseId}`,
      'inactive',
    );
  });

  it('shows PluginSlot content area when verifiedMode is truthy', async () => {
    renderPanel({}, { courseHomeMeta: { verifiedMode: { price: 100 } } });

    await waitFor(() => {
      expect(screen.queryByText(/no upgrade options available/i)).not.toBeInTheDocument();
    });
  });

  it('includes course metadata in the track event payload', () => {
    renderPanel({}, {
      coursewareMeta: { enrollmentMode: 'verified' },
      courseHomeMeta: { org: 'TestOrg', username: 'testuser' },
    });

    expect(sendTrackEvent).toHaveBeenCalledWith(
      'edx.ui.course.upgrade.sidebar.upgrade.panel',
      expect.objectContaining({
        name: 'Sidebar Upgrade Panel',
        is_upgrade_panel_visible: false,
      }),
    );
  });
});
