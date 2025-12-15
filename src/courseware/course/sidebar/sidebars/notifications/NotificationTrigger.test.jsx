import React from 'react';
import PropTypes from 'prop-types';
import { Factory } from 'rosie';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
import { getSessionStorage, setSessionStorage } from '@src/data/sessionStorage';
import {
  fireEvent, initializeTestStore, render, screen,
} from '../../../../../setupTest';
import SidebarContext from '../../SidebarContext';
import NotificationTrigger, { ID } from './NotificationTrigger';

jest.mock('@src/data/localStorage', () => ({
  getLocalStorage: jest.fn(),
  setLocalStorage: jest.fn(),
}));

jest.mock('@src/data/sessionStorage', () => ({
  getSessionStorage: jest.fn(),
  setSessionStorage: jest.fn(),
}));

describe('Notification Trigger', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');

  beforeEach(async () => {
    await initializeTestStore({
      courseMetadata,
      excludeFetchCourse: true,
      excludeFetchSequence: true,
    });

    jest.clearAllMocks();

    mockData = {
      courseId: courseMetadata.id,
      toggleSidebar: jest.fn(),
      currentSidebar: null,
      notificationStatus: 'inactive',
      setNotificationStatus: jest.fn(),
      upgradeNotificationCurrentState: 'FPDdaysLeft',
    };

    getLocalStorage.mockReturnValue(null);
    getSessionStorage.mockReturnValue('closed');
  });

  const SidebarWrapper = ({ contextValue, onClick }) => (
    <SidebarContext.Provider value={contextValue}>
      <NotificationTrigger onClick={onClick} />
    </SidebarContext.Provider>
  );

  SidebarWrapper.propTypes = {
    contextValue: PropTypes.shape({}).isRequired,
    onClick: PropTypes.func.isRequired,
  };

  function renderWithProvider(data, onClick = () => {}) {
    const { container } = render(<SidebarWrapper contextValue={{ ...mockData, ...data }} onClick={onClick} />);
    return container;
  }

  it('handles onClick event toggling the notification tray', async () => {
    const toggleNotificationTray = jest.fn();
    const testData = {
      ...mockData,
      toggleSidebar: toggleNotificationTray,
    };
    const onClickProp = jest.fn();

    renderWithProvider(testData, onClickProp);

    const notificationTrigger = screen.getByRole('button', { name: /Show notification tray/i });
    expect(notificationTrigger).toBeInTheDocument();

    fireEvent.click(notificationTrigger);

    expect(onClickProp).toHaveBeenCalledTimes(1);
    expect(setSessionStorage).toHaveBeenCalledWith(`notificationTrayStatus.${mockData.courseId}`, 'open');
  });

  it('renders notification trigger icon with red dot when notificationStatus is active', async () => {
    const container = renderWithProvider({ notificationStatus: 'active' });
    expect(container).toBeInTheDocument();
    const buttonIcon = container.querySelectorAll('svg');
    expect(buttonIcon).toHaveLength(1);
    expect(screen.getByTestId('notification-dot')).toBeInTheDocument();
  });

  it('renders notification trigger icon WITHOUT red dot within the same phase', async () => {
    getLocalStorage.mockReturnValue('sameState');

    const container = renderWithProvider({
      upgradeNotificationLastSeen: 'sameState',
      upgradeNotificationCurrentState: 'sameState',
    });

    expect(container).toBeInTheDocument();

    expect(getLocalStorage).toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`);

    const buttonIcon = container.querySelectorAll('svg');
    expect(buttonIcon).toHaveLength(1);
    expect(screen.queryByRole('notification-dot')).not.toBeInTheDocument();
  });

  it('makes the right updates when rendering a new phase from an UpgradeNotification change (before -> after)', async () => {
    getLocalStorage.mockImplementation((key) => {
      if (key.includes('upgradeNotificationLastSeen')) { return 'before'; }
      return null;
    });

    const container = renderWithProvider({
      upgradeNotificationCurrentState: 'after',
    });

    expect(container).toBeInTheDocument();

    expect(getLocalStorage).toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`);
    expect(setLocalStorage).toHaveBeenCalledWith(`notificationStatus.${mockData.courseId}`, 'active');
    expect(setLocalStorage).toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`, 'after');
  });

  it('handles localStorage from a different course', async () => {
    getLocalStorage.mockImplementation((key) => {
      if (key === `upgradeNotificationLastSeen.${mockData.courseId}`) { return 'before'; }
      return 'accessDateView';
    });

    const container = renderWithProvider({
      upgradeNotificationCurrentState: 'after',
    });

    expect(container).toBeInTheDocument();

    expect(setLocalStorage).toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`, 'after');
    expect(setLocalStorage).toHaveBeenCalledWith(`notificationStatus.${mockData.courseId}`, 'active');

    expect(setLocalStorage).not.toHaveBeenCalledWith(expect.stringContaining('second_id'), expect.anything());
  });

  it('initializes default localStorage values if they are missing', () => {
    getLocalStorage.mockReturnValue(null);

    renderWithProvider({});

    expect(setLocalStorage).toHaveBeenCalledWith(`notificationStatus.${mockData.courseId}`, 'active');
    expect(setLocalStorage).toHaveBeenCalledWith(`upgradeNotificationCurrentState.${mockData.courseId}`, 'initialize');
  });

  it('automatically opens sidebar if notification tray is open in session and sidebar is closed', () => {
    getSessionStorage.mockReturnValue('open');
    const contextData = { currentSidebar: null, toggleSidebar: jest.fn() };

    renderWithProvider(contextData);

    expect(contextData.toggleSidebar).toHaveBeenCalledWith(ID);
  });

  it('does NOT automatically open sidebar if it is already open (even if tray is open)', () => {
    getSessionStorage.mockReturnValue('open');
    const contextData = { currentSidebar: 'discussions', toggleSidebar: jest.fn() };

    renderWithProvider(contextData);

    expect(contextData.toggleSidebar).not.toHaveBeenCalled();
  });
});
