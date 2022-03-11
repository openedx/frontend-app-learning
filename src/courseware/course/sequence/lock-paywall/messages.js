import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.lockPaywall.title': {
    id: 'learn.lockPaywall.title',
    defaultMessage: 'Graded assignments are locked',
    description: 'Heading for message shown to indicate that a piece of content is unavailable to audit track users.',
  },
  'learn.lockPaywall.content': {
    id: 'learn.lockPaywall.content',
    defaultMessage: 'Upgrade to gain access to locked features like this one and get the most out of your course.',
    description: 'Message shown to indicate that a piece of content is unavailable to audit track users.',
  },
  'learn.lockPaywall.content.pastExpiration': {
    id: 'learn.lockPaywall.content.pastExpiration',
    defaultMessage: 'The upgrade deadline for this course passed. To upgrade, enroll in the next available session. ',
    description: 'Message shown to indicate that a piece of content is unavailable to audit track users in a course where the expiration deadline has passed.',
  },
  'learn.lockPaywall.courseDetails': {
    id: 'learn.lockPaywall.courseDetails',
    defaultMessage: 'View Course Details',
    description: 'Link to the course details page for this course with a past expiration date.',
  },
  'learn.lockPaywall.example.alt': {
    id: 'learn.lockPaywall.example.alt',
    defaultMessage: 'Example Certificate',
    description: 'Alternate text displayed when the example certificate image cannot be displayed.',
  },
  'learn.lockPaywall.list.intro': {
    id: 'learn.lockPaywall.list.intro',
    defaultMessage: 'When you upgrade, you:',
    description: 'Text displayed to introduce the list of benefits from upgrading.',
  },
});

export default messages;
