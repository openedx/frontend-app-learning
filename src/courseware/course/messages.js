import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  sidebarNotification: {
    id: 'sidebar.notification.container',
    defaultMessage: 'Sidebar notification',
    description: 'Sidebar notification section container',
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
