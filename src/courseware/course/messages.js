import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  notificationTray: {
    id: 'notification.tray.container',
    defaultMessage: 'Notification tray',
    description: 'Notification tray container',
  },
  openSidebarButton: {
    id: 'sidebar.open.button',
    defaultMessage: 'Show sidebar notification',
    description: 'Button to open the sidebar and show notifications',
  },
  closeSidebarButton: {
    id: 'sidebar.close.button',
    defaultMessage: 'Close sidebar notification',
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
