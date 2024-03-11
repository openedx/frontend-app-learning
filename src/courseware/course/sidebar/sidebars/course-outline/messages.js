import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  courseOutlineTray: {
    id: 'courseOutline.tray.container',
    defaultMessage: 'Course outline tray',
    description: 'course outline tray container',
  },
  openCourseOutlineTrigger: {
    id: 'courseOutline.open.button',
    defaultMessage: 'Show course outline tray',
    description: 'Button to open the course outline tray and show sidebar',
  },
  closeCourseOutlineTrigger: {
    id: 'courseOutline.close.button',
    defaultMessage: 'Close course outline tray',
    description: 'Button for the learner to close the sidebar',
  },
  courseOutlineTitle: {
    id: 'courseOutline.tray.title',
    defaultMessage: 'Course Outline',
    description: 'Title text displayed for the course outline tray',
  },
  collapseAll: {
    id: 'courseOutline.tray.collapseAll',
    defaultMessage: 'Collapse all',
    description: 'Label for button to close all of the collapsible sections',
  },
  expandAll: {
    id: 'courseOutline.tray.expandAll',
    defaultMessage: 'Expand all',
    description: 'Label for button to open all of the collapsible sections',
  },
});

export default messages;
