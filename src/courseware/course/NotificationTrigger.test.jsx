import React from 'react';
import { Factory } from 'rosie';
import {
  render, initializeTestStore, screen, fireEvent,
} from '../../setupTest';
import NotificationTrigger from './NotificationTrigger';

describe('Notification Trigger', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');

  beforeAll(async () => {
    await initializeTestStore({ courseMetadata, excludeFetchCourse: true, excludeFetchSequence: true });
    mockData = {
      toggleNotificationTray: () => {},
      isNotificationTrayVisible: () => {},
    };
  });

  it('renders notification trigger with icon', async () => {
    const { container } = render(<NotificationTrigger {...mockData} />);
    expect(container).toBeInTheDocument();
    const buttonIcon = container.querySelectorAll('svg');
    expect(buttonIcon).toHaveLength(1);

    // REV-2130 TODO: update below test once the status=active or inactive is implemented
    expect(screen.getByTestId('notification-dot')).toBeInTheDocument();
  });

  it('handles onClick event toggling the notification tray', async () => {
    const toggleNotificationTray = jest.fn();
    const testData = {
      ...mockData,
      toggleNotificationTray,
    };
    render(<NotificationTrigger {...testData} />);

    const notificationOpenButton = screen.getByRole('button', { name: /Show notification tray/i });
    expect(notificationOpenButton).toBeInTheDocument();
    fireEvent.click(notificationOpenButton);
    expect(toggleNotificationTray).toHaveBeenCalledTimes(1);
  });
});
