import React from 'react';
import { Factory } from 'rosie';
import {
  render, initializeTestStore, screen, fireEvent,
} from '../../setupTest';
import NotificationTrigger from './NotificationTrigger';
import { getLocalStorage } from '../../data/localStorage';

describe('Notification Trigger', () => {
  let mockDataBaseline;
  let mockDataSameState;
  let mockDataDifferentState;
  const courseMetadata = Factory.build('courseMetadata');

  beforeAll(async () => {
    await initializeTestStore({ courseMetadata, excludeFetchCourse: true, excludeFetchSequence: true });
    mockDataBaseline = {
      toggleNotificationTray: () => {},
      isNotificationTrayVisible: () => {},
      notificationStatus: 'active',
      setNotificationStatus: () => {},
      currentState: 'FPDdaysLeft',
    };
    mockDataSameState = {
      toggleNotificationTray: () => {},
      isNotificationTrayVisible: () => {},
      notificationStatus: 'inactive',
      setNotificationStatus: () => {},
      currentState: 'sameState',
      lastSeen: 'sameState',
    };
    mockDataDifferentState = {
      toggleNotificationTray: () => {},
      isNotificationTrayVisible: () => {},
      notificationStatus: 'inactive',
      setNotificationStatus: () => {},
      currentState: 'after',
      lastSeen: 'before',
    };
  });

  it('renders notification trigger with icon when notificationStatus is active', async () => {
    const { container } = render(<NotificationTrigger {...mockDataBaseline} />);
    expect(container).toBeInTheDocument();
    const buttonIcon = container.querySelectorAll('svg');
    expect(buttonIcon).toHaveLength(1);
    expect(screen.getByTestId('notification-dot')).toBeInTheDocument();
  });

  it('renders notification trigger WITHOUT icon 3 seconds later', async () => {
    const { container } = render(<NotificationTrigger {...mockDataBaseline} />);
    expect(container).toBeInTheDocument();
    jest.useFakeTimers();
    setTimeout(() => {
      expect(screen.queryByRole('notification-dot')).not.toBeInTheDocument();
    }, 3000);
    jest.runAllTimers();
  });

  it('renders notification trigger WITHOUT icon within the same phase', async () => {
    const { container } = render(<NotificationTrigger {...mockDataSameState} />);
    expect(container).toBeInTheDocument();
    const buttonIcon = container.querySelectorAll('svg');
    expect(buttonIcon).toHaveLength(1);
    expect(screen.queryByRole('notification-dot')).not.toBeInTheDocument();
  });

  it('handles onClick event toggling the notification tray', async () => {
    const toggleNotificationTray = jest.fn();
    const testData = {
      ...mockDataBaseline,
      toggleNotificationTray,
    };
    render(<NotificationTrigger {...testData} />);

    const notificationTrigger = screen.getByRole('button', { name: /Show notification tray/i });
    expect(notificationTrigger).toBeInTheDocument();
    fireEvent.click(notificationTrigger);
    expect(toggleNotificationTray).toHaveBeenCalledTimes(1);
  });

  it('we make the right updates when rendering a new phase (before -> after)', async () => {
    const { container } = render(<NotificationTrigger {...mockDataDifferentState} />);
    expect(container).toBeInTheDocument();

    // rendering NotificationTrigger has the effect of calling updateLastSeen()
    // Verify that local storage was updated accordingly
    expect(getLocalStorage('notificationStatus')).toBe('active');
    expect(getLocalStorage('lastSeen')).toBe('after');
  });
});
