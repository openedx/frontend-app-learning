import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  notificationButton: {
    id: 'sidebar.notificationButton',
    defaultMessage: 'Sidebar notification button',
    description: 'Button to open the sidebar',
  },
  closeButton: {
    id: 'sidebar.closeButton',
    defaultMessage: 'Close',
    description: 'Button for the learner to close the sidebar',
  },
  responsiveCloseSidebar: {
    id: 'sidebar.responsiveCloseSidebar',
    defaultMessage: 'Back to course',
    description: 'Responsive link for the learner to go back to course and close sidebar',
  },
  notification: {
    id: 'sidebar.notification',
    defaultMessage: 'Notifications',
    description: 'Text displayed for sidebar notifications',
  },
});

export default messages;
