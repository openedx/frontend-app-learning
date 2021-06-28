import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  sidebarNotification: {
    id: 'sidebar.notification.container',
    defaultMessage: 'Sidebar notification',
    description: 'Sidebar notification section container',
  },
  openNotificationTrigger: {
    id: 'notification.open.button',
    defaultMessage: 'Show notification tray',
    description: 'Button to open the notification tray and show notifications',
  },
  closeNotificationTrigger: {
    id: 'notification.close.button',
    defaultMessage: 'Close sidebar notification',
    description: 'Button for the learner to close the sidebar',
  },
  responsiveCloseSidebar: {
    id: 'sidebar.responsive.close.button',
    defaultMessage: 'Back to course',
    description: 'Responsive button for the learner to go back to course and close the sidebar',
  },
  notificationTitle: {
    id: 'sidebar.notification.title',
    defaultMessage: 'Notifications',
    description: 'Title text displayed for sidebar notifications',
  },
  noNotificationsMessage: {
    id: 'sidebar.notification.no.message',
    defaultMessage: 'You have no new notifications at this time.',
    description: 'Text displayed when the learner has no notifications',
  },
});

export default messages;
