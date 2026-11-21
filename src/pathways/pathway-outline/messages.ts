import { defineMessages } from '@edx/frontend-platform/i18n';
import { PathwayItemType } from 'pathways/data/types';

export const messages = defineMessages({
  itemEnds: {
    id: 'learning.pathways.outline.item.ends',
    defaultMessage: 'Ends {date}',
    description: 'Label that show when the item ends',
  },
  certificateAvailable: {
    id: 'learning.pathways.outline.item.certificate-available',
    defaultMessage: 'Certificate available',
    description: 'Label that show if a certificate is available for the item',
  },
  // TODO: When the pathway includes items other than just the course, this message will need to be changed. For now, I’m leaving it as is for convenience.
  completeMessage: {
    id: 'learning.pathways.outline.complete-message',
    defaultMessage: 'Complete {count, plural, one {this course} other {these # courses}} in any order',
    description: 'Instruction to complete the courses of the pathway in any order',
  },
  'itemStatusLabel-in-progress': {
    id: 'learning.pathways.outline.item.in-progress',
    defaultMessage: 'In progress',
    description: 'Label for the in progress status of an item',
  },
  'itemStatusLabel-not-passed': {
    id: 'learning.pathways.outline.item.not-passed',
    defaultMessage: 'Not passed',
    description: 'Label for the not passed status of an item',
  },
  'itemStatusLabel-passed': {
    id: 'learning.pathways.outline.item.passed',
    defaultMessage: 'Passed',
    description: 'Label for the passed status of an item',
  },
});

const courseItemMessages = defineMessages({
  itemLabel: {
    id: 'learning.pathways.outline.item.course',
    defaultMessage: 'Course',
    description: 'Label for a course item in pathways',
  },
  beginBtn: {
    id: 'learning.pathways.outline.item.begin.btn',
    defaultMessage: 'Begin course',
    description: 'Label of the button to start the given course.',
  },
});

export const getItemMessage = (type: PathwayItemType) => {
  if (type === 'course') {
    return courseItemMessages;
  }
  return {
    itemLabel: {},
    beginBtn: {},
  }
};

