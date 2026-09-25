import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SidebarProvider } from '@src/courseware/course/sidebar/SidebarContext';
import * as localStorageModule from '@src/data/localStorage';
import UpgradeTrigger from './UpgradeTrigger';
import { upgradeWidgetConfig } from './widgetConfig';

jest.mock('@src/data/localStorage', () => ({
  getLocalStorage: jest.fn(() => null),
  setLocalStorage: jest.fn(),
}));

jest.mock('@src/generic/model-store', () => ({
  useModel: jest.fn(() => ({})),
}));

jest.mock('@src/course-home/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-home/data/apiHooks'),
  useCourseHomeMeta: jest.fn(() => ({ data: {} })),
}));

jest.mock('@src/courseware/data/apiHooks', () => ({
  ...jest.requireActual('@src/courseware/data/apiHooks'),
  useDiscussionTopic: jest.fn(() => ({ data: undefined })),
}));

const courseId = 'course-test-123';

// The sidebar provider mounts the upgrade widget config's Provider, which the trigger reads.
const renderWithSidebar = (ui) => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <SidebarProvider courseId={courseId} unitId="unit-test-456" widgets={[upgradeWidgetConfig]}>
        {ui}
      </SidebarProvider>
    </MemoryRouter>
  </IntlProvider>,
);

function renderTrigger(localStorageOverride = null) {
  localStorageModule.getLocalStorage.mockImplementation((key) => {
    if (localStorageOverride) {
      return localStorageOverride(key);
    }
    return null;
  });

  return renderWithSidebar(<UpgradeTrigger onClick={jest.fn()} />);
}

describe('UpgradeTrigger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a button with the correct aria-label', () => {
    renderTrigger();

    expect(screen.getByRole('button', { name: /show upgrade panel/i })).toBeInTheDocument();
  });

  it('renders the UpgradeIcon inside the button', () => {
    renderTrigger();
    const button = screen.getByRole('button', { name: /show upgrade panel/i });

    expect(button).toBeInTheDocument();
  });

  it('calls the onClick prop when the button is clicked', () => {
    const onClick = jest.fn();
    renderWithSidebar(<UpgradeTrigger onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /show upgrade panel/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows status dot when upgradeWidgetStatus is "active"', () => {
    // Default status from localStorage is null, so provider defaults to "active"
    renderTrigger();

    expect(screen.getByTestId('upgrade-status-dot')).toBeInTheDocument();
  });

  it('does not show status dot when upgradeWidgetStatus is "inactive" from localStorage', () => {
    renderTrigger((key) => {
      if (key === `upgradeWidget.${courseId}`) { return 'inactive'; }
      return null;
    });

    expect(screen.queryByTestId('upgrade-status-dot')).not.toBeInTheDocument();
  });

  it('sets status to active and updates lastSeen when upgradeCurrentState differs from last seen', () => {
    renderTrigger((key) => {
      if (key === `upgradeWidget.${courseId}`) { return 'inactive'; }
      if (key === `upgradeWidgetState.${courseId}`) { return 'new-state'; }
      if (key === `upgradeWidgetLastSeen.${courseId}`) { return 'old-state'; }
      return null;
    });

    expect(localStorageModule.setLocalStorage).toHaveBeenCalledWith(
      `upgradeWidgetLastSeen.${courseId}`,
      'new-state',
    );
    expect(localStorageModule.setLocalStorage).toHaveBeenCalledWith(
      `upgradeWidget.${courseId}`,
      'active',
    );
  });

  it('does not update status when upgradeCurrentState matches last seen', () => {
    renderTrigger((key) => {
      if (key === `upgradeWidget.${courseId}`) { return 'inactive'; }
      if (key === `upgradeWidgetState.${courseId}`) { return 'same-state'; }
      if (key === `upgradeWidgetLastSeen.${courseId}`) { return 'same-state'; }
      return null;
    });

    expect(localStorageModule.setLocalStorage).not.toHaveBeenCalledWith(
      `upgradeWidget.${courseId}`,
      'active',
    );
  });
});
