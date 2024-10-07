import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  discussionsTitle: {
    id: 'discussions.sidebar.title',
    defaultMessage: 'Discussions',
    description: 'Title text for a forum where users are able to discuss course topics',
  },
  discussionNotificationTray: {
    id: 'discussions.notification.tray.container',
    defaultMessage: 'Discussion and Notification tray',
    description: 'Discussion and Notification tray container',
  },
  notificationTitle: {
    id: 'notification.tray.title',
    defaultMessage: 'Notifications',
    description: 'Title text displayed for the notification tray',
  },
  closeTrigger: {
    id: 'tray.close.button',
    defaultMessage: 'Close tray',
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
