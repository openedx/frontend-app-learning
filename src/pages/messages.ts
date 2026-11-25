import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  'learning.courseTab.page.title': {
    id: 'learning.courseTab.page.title',
    defaultMessage: '{tabTitle} | {courseTitle} | {siteName}',
    description: 'Document title of a course tab: the name of the tab, of the course and of the site',
  },
  'learning.course.page.title': {
    id: 'learning.course.page.title',
    defaultMessage: '{courseTitle} | {siteName}',
    description: 'Document title of a course page with no name of its own: the name of the course and of the site',
  },
  'learning.courseware.page.title': {
    id: 'learning.courseware.page.title',
    defaultMessage: '{sequenceTitle} | {sectionTitle} | {courseTitle} | {siteName}',
    description: 'Document title of a unit: the name of its subsection, of its section, of the course and of the site',
  },
});

export default messages;
