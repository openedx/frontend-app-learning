import React from 'react';
import { Factory } from 'rosie';
import {
  render, initializeTestStore, screen, fireEvent,
} from '../../setupTest';
import NotificationTrigger from './NotificationTrigger';
import { getLocalStorage } from '../../data/localStorage';

describe('Notification Trigger', () => {
  let mockData;
  // let mockDataSameState;
  // let mockDataDifferentState;
  const courseMetadata = Factory.build('courseMetadata');

  beforeEach(async () => {
    await initializeTestStore({ courseMetadata, excludeFetchCourse: true, excludeFetchSequence: true });
    mockData = {
      toggleNotificationTray: () => {},
      isNotificationTrayVisible: () => {},
      notificationStatus: 'active',
      setNotificationStatus: () => {},
      upgradeNotificationCurrentState: 'FPDdaysLeft',
    };
  });

  it('renders notification trigger icon with red dot when notificationStatus is active', async () => {
    const { container } = render(<NotificationTrigger {...mockData} />);
    expect(container).toBeInTheDocument();
    const buttonIcon = container.querySelectorAll('svg');
    expect(buttonIcon).toHaveLength(1);
    expect(screen.getByTestId('notification-dot')).toBeInTheDocument();
  });

  it('renders notification trigger icon WITHOUT red dot 3 seconds later', async () => {
    const { container } = render(<NotificationTrigger {...mockData} />);
    expect(container).toBeInTheDocument();
    jest.useFakeTimers();
    setTimeout(() => {
      expect(screen.queryByRole('notification-dot')).not.toBeInTheDocument();
    }, 3000);
    jest.runAllTimers();
  });

  it('renders notification trigger icon WITHOUT red dot within the same phase', async () => {
    const { container } = render(
      <NotificationTrigger {...mockData} upgradeNotificationCurrentState="sameState" upgradeNotificationLastSeen="sameState" />,
    );
    expect(container).toBeInTheDocument();
    const buttonIcon = container.querySelectorAll('svg');
    expect(buttonIcon).toHaveLength(1);
    expect(screen.queryByRole('notification-dot')).not.toBeInTheDocument();
  });

  it('handles onClick event toggling the notification tray', async () => {
    const toggleNotificationTray = jest.fn();
    const testData = {
      ...mockData,
      toggleNotificationTray,
    };
    render(<NotificationTrigger {...testData} />);

    const notificationTrigger = screen.getByRole('button', { name: /Show notification tray/i });
    expect(notificationTrigger).toBeInTheDocument();
    fireEvent.click(notificationTrigger);
    expect(toggleNotificationTray).toHaveBeenCalledTimes(1);
  });

  // rendering NotificationTrigger has the effect of calling UpdateUpgradeNotificationLastSeen()
  // Verify that local storage was updated accordingly
  it('we make the right updates when rendering a new phase (before -> after)', async () => {
    const { container } = render(
      <NotificationTrigger {...mockData} upgradeNotificationLastSeen="before" upgradeNotificationCurrentState="after" />,
    );
    expect(container).toBeInTheDocument();

    expect(getLocalStorage('notificationStatus')).toBe('active');
    expect(getLocalStorage('upgradeNotificationLastSeen')).toBe('after');
  });
});
