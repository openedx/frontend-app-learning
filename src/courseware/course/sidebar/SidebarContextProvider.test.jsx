import { useContext } from 'react';
import userEvent from '@testing-library/user-event';
import { useWindowSize } from '@openedx/paragon';

import { useModel } from '@src/generic/model-store';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
import { getSessionStorage } from '@src/data/sessionStorage';

import { initializeTestStore, render, screen } from '@src/setupTest';
import SidebarProvider from './SidebarContextProvider';
import SidebarContext from './SidebarContext';
import * as discussionsSidebar from './sidebars/discussions';
import * as notificationsSidebar from './sidebars/notifications';

jest.mock('@openedx/paragon', () => ({
  ...jest.requireActual('@openedx/paragon'),
  useWindowSize: jest.fn(),
  breakpoints: {
    extraLarge: { minWidth: 1200 },
  },
}));

jest.mock('@src/generic/model-store', () => {
  const actual = jest.requireActual('@src/generic/model-store');
  return {
    ...actual,
    useModel: jest.fn(),
  };
});

jest.mock('@src/data/localStorage', () => ({
  getLocalStorage: jest.fn(),
  setLocalStorage: jest.fn(),
}));

jest.mock('@src/data/sessionStorage', () => ({
  getSessionStorage: jest.fn(),
}));

jest.mock('./sidebars/discussions', () => ({ ID: 'discussions' }));
jest.mock('./sidebars/notifications', () => ({ ID: 'notifications' }));
jest.mock('./sidebars', () => ({
  SIDEBARS: {
    discussions: { ID: 'discussions' },
    notifications: { ID: 'notifications' },
  },
}));

const TestConsumer = () => {
  const {
    currentSidebar,
    toggleSidebar,
    onNotificationSeen,
    notificationStatus,
  } = useContext(SidebarContext);

  return (
    <div>
      <div data-testid="current-sidebar">{currentSidebar || 'none'}</div>
      <div data-testid="notification-status">{notificationStatus || 'none'}</div>
      <button type="button" onClick={() => toggleSidebar(discussionsSidebar.ID)}>Toggle Discussions</button>
      <button type="button" onClick={onNotificationSeen}>See Notifications</button>
    </div>
  );
};

describe('SidebarContextProvider', () => {
  const defaultProps = {
    courseId: 'course-v1:test',
    unitId: 'unit-1',
  };

  beforeAll(async () => {
    await initializeTestStore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useWindowSize.mockReturnValue({ width: 1400 });
    useModel.mockReturnValue({});
    getLocalStorage.mockReturnValue(null);
    getSessionStorage.mockReturnValue(null);
  });

  it('renders without crashing and provides default context', () => {
    render(
      <SidebarProvider {...defaultProps}>
        <TestConsumer />
      </SidebarProvider>,
    );
    expect(screen.getByTestId('current-sidebar')).toHaveTextContent('none');
  });

  it('initializes with notifications sidebar if notification tray is open in session storage', () => {
    getSessionStorage.mockReturnValue('open');

    render(
      <SidebarProvider {...defaultProps}>
        <TestConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('current-sidebar')).toHaveTextContent(notificationsSidebar.ID);
  });

  it('loads initial sidebar from local storage on small screens (mobile behavior)', () => {
    useWindowSize.mockReturnValue({ width: 800 });
    getLocalStorage.mockImplementation((key) => {
      if (key === `sidebar.${defaultProps.courseId}`) { return discussionsSidebar.ID; }
      return null;
    });

    render(
      <SidebarProvider {...defaultProps}>
        <TestConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('current-sidebar')).toHaveTextContent(discussionsSidebar.ID);
  });

  it('does not load from local storage on large screens (desktop behavior)', () => {
    useWindowSize.mockReturnValue({ width: 1400 });
    getLocalStorage.mockReturnValue(discussionsSidebar.ID);

    render(
      <SidebarProvider {...defaultProps}>
        <TestConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('current-sidebar')).toHaveTextContent('none');
  });

  it('toggles sidebar open and updates local storage', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider {...defaultProps}>
        <TestConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('current-sidebar')).toHaveTextContent('none');

    await user.click(screen.getByText('Toggle Discussions'));

    expect(screen.getByTestId('current-sidebar')).toHaveTextContent(discussionsSidebar.ID);
    expect(setLocalStorage).toHaveBeenCalledWith(`sidebar.${defaultProps.courseId}`, discussionsSidebar.ID);
  });

  it('toggles sidebar closed (null) if clicking the same sidebar', async () => {
    useWindowSize.mockReturnValue({ width: 800 });
    getLocalStorage.mockReturnValue(discussionsSidebar.ID);
    const user = userEvent.setup();

    render(
      <SidebarProvider {...defaultProps}>
        <TestConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('current-sidebar')).toHaveTextContent(discussionsSidebar.ID);

    await user.click(screen.getByText('Toggle Discussions'));

    expect(screen.getByTestId('current-sidebar')).toHaveTextContent('none');
    expect(setLocalStorage).toHaveBeenCalledWith(`sidebar.${defaultProps.courseId}`, null);
  });

  it('updates notification status when seen', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider {...defaultProps}>
        <TestConsumer />
      </SidebarProvider>,
    );

    await user.click(screen.getByText('See Notifications'));

    expect(setLocalStorage).toHaveBeenCalledWith(`notificationStatus.${defaultProps.courseId}`, 'inactive');
    expect(screen.getByTestId('notification-status')).toHaveTextContent('inactive');
  });

  it('updates current sidebar when unitId changes (Effect trigger)', () => {
    useWindowSize.mockReturnValue({ width: 800 });
    getLocalStorage.mockReturnValue(notificationsSidebar.ID);

    const { rerender } = render(
      <SidebarProvider {...defaultProps}>
        <TestConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('current-sidebar')).toHaveTextContent(notificationsSidebar.ID);

    useModel.mockImplementation((model) => {
      if (model === 'discussionTopics') { return { id: 'topic-1', enabledInContext: true }; }
      return {};
    });

    rerender(
      <SidebarProvider {...defaultProps} unitId="unit-2">
        <TestConsumer />
      </SidebarProvider>,
    );
  });
});
