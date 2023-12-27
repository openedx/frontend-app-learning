import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  notificationTray: {
    id: 'notification.tray.container',
    defaultMessage: 'Notification tray',
    description: 'Notification tray container',
  },
  notificationTitle: {
    id: 'notification.tray.title',
    defaultMessage: 'Notifications',
    description: 'Title text displayed for the notification tray',
  },
  closeNotificationTrigger: {
    id: 'notification.close.button',
    defaultMessage: 'Close notification tray',
    description: 'Button for the learner to close the sidebar',
  },
  openSidebarTrigger: {
    id: 'sidebar.open.button',
    defaultMessage: 'Show sidebar tray',
    description: 'Button to open the sidebar tray and shows notifications and didcussions',
  },
  responsiveCloseSidebarTray: {
    id: 'responsive.close.sidebar',
    defaultMessage: 'Back to course',
    description: 'Responsive button to go back to course and close the sidebar tray',
  },
});

export default messages;
