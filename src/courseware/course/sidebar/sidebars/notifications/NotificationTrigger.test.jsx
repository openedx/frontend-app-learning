import React from 'react';
import PropTypes from 'prop-types';
import { Factory } from 'rosie';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
import { getSessionStorage, setSessionStorage } from '@src/data/sessionStorage';
import {
  fireEvent, initializeTestStore, render, screen,
} from '../../../../../setupTest';
import SidebarContext from '../../SidebarContext';
// FIX 1: Імпортуємо ID
import NotificationTrigger, { ID } from './NotificationTrigger';

// FIX 2: Використовуємо модульні моки замість window.localStorage

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

    // Default mocks
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
      toggleSidebar: toggleNotificationTray, // Fix naming for consistnecy if needed, usually passed via context
    };
    // We are testing the onClick passed to component, not context toggle here specifically for the trigger click
    const onClickProp = jest.fn();

    renderWithProvider(testData, onClickProp);

    const notificationTrigger = screen.getByRole('button', { name: /Show notification tray/i });
    expect(notificationTrigger).toBeInTheDocument();

    fireEvent.click(notificationTrigger);

    expect(onClickProp).toHaveBeenCalledTimes(1);
    // Check SessionStorage update via module mock
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
    // FIX: Mock return value directly
    getLocalStorage.mockReturnValue('sameState');

    const container = renderWithProvider({
      upgradeNotificationLastSeen: 'sameState',
      upgradeNotificationCurrentState: 'sameState',
    });

    expect(container).toBeInTheDocument();

    // Check module mock call
    expect(getLocalStorage).toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`);

    const buttonIcon = container.querySelectorAll('svg');
    expect(buttonIcon).toHaveLength(1);
    expect(screen.queryByRole('notification-dot')).not.toBeInTheDocument();
  });

  it('makes the right updates when rendering a new phase from an UpgradeNotification change (before -> after)', async () => {
    // FIX: Mock implementation to return 'before' for lastSeen
    getLocalStorage.mockImplementation((key) => {
      if (key.includes('upgradeNotificationLastSeen')) { return 'before'; }
      return null;
    });

    const container = renderWithProvider({
      upgradeNotificationCurrentState: 'after',
    });

    expect(container).toBeInTheDocument();

    // Verify calls to module mocks
    expect(getLocalStorage).toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`);
    expect(setLocalStorage).toHaveBeenCalledWith(`notificationStatus.${mockData.courseId}`, 'active');
    expect(setLocalStorage).toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`, 'after');
  });

  it('handles localStorage from a different course', async () => {
    // This test logic was checking if localStorage affects other courses.
    // Since we mock the module, we verify that we call it with the CORRECT course ID.

    getLocalStorage.mockImplementation((key) => {
      if (key === `upgradeNotificationLastSeen.${mockData.courseId}`) { return 'before'; }
      return 'accessDateView'; // Simulate other data existing
    });

    const container = renderWithProvider({
      upgradeNotificationCurrentState: 'after',
    });

    expect(container).toBeInTheDocument();

    // Verify we updated OUR course
    expect(setLocalStorage).toHaveBeenCalledWith(`upgradeNotificationLastSeen.${mockData.courseId}`, 'after');
    expect(setLocalStorage).toHaveBeenCalledWith(`notificationStatus.${mockData.courseId}`, 'active');

    // Verify we did NOT update the other course (mock check)
    expect(setLocalStorage).not.toHaveBeenCalledWith(expect.stringContaining('second_id'), expect.anything());
  });

  // --- Coverage Tests ---

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

    // FIX 1: ID is now imported and defined
    expect(contextData.toggleSidebar).toHaveBeenCalledWith(ID);
  });

  it('does NOT automatically open sidebar if it is already open (even if tray is open)', () => {
    getSessionStorage.mockReturnValue('open');
    const contextData = { currentSidebar: 'discussions', toggleSidebar: jest.fn() };

    renderWithProvider(contextData);

    expect(contextData.toggleSidebar).not.toHaveBeenCalled();
  });
});
