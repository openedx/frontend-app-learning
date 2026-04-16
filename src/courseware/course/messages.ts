import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  notificationTray: {
    id: 'notification.tray.container',
    defaultMessage: 'Notification tray',
    description: 'Notification tray container',
  },
  openNotificationTrigger: {
    id: 'notification.open.button',
    defaultMessage: 'Show notification tray',
    description: 'Button to open the notification tray and show notifications',
  },
  closeNotificationTrigger: {
    id: 'notification.close.button',
    defaultMessage: 'Close notification tray',
    description: 'Button for the learner to close the sidebar',
  },
  responsiveCloseNotificationTray: {
    id: 'responsive.close.notification',
    defaultMessage: 'Back to course',
    description: 'Responsive button to go back to course and close the notification tray',
  },
  notificationTitle: {
    id: 'notification.tray.title',
    defaultMessage: 'Notifications',
    description: 'Title text displayed for the notification tray',
  },
  noNotificationsMessage: {
    id: 'notification.tray.no.message',
    defaultMessage: 'You have no new notifications at this time.',
    description: 'Text displayed when the learner has no notifications',
  },
});

export default messages;
