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
  // TODO: When the pathway includes items other than just the course, this message will need to be changed.
  // For now, I’m leaving it as is for convenience.
  completeMessage: {
    id: 'learning.pathways.outline.complete-message',
    defaultMessage: 'Complete {count, plural, one {this course} other {these # courses}} in any order',
    description: 'Instruction to complete the courses of the pathway in any order',
  },
  overviewTitle: {
    id: 'learning.pathways.outline.overview.title',
    defaultMessage: '{categoryLabel} overview',
    description: 'Title of the card that shows how many items of the pathway the learner has completed',
  },
  // TODO: Same as `completeMessage`, it must change when the pathway includes items other than courses.
  overviewCompletedCount: {
    id: 'learning.pathways.outline.overview.completed-count',
    defaultMessage: '{completed} of {total, plural, one {# course} other {# courses}}',
    description: 'How many courses of the pathway the learner has completed, below the progress donut',
  },
  overviewDetailsLink: {
    id: 'learning.pathways.outline.overview.details-link',
    defaultMessage: 'About this {categoryLabel}',
    description: 'Link below the overview card to the catalog page that describes the pathway',
  },
  showItemOutline: {
    id: 'learning.pathways.outline.item.show-outline',
    defaultMessage: 'Show outline',
    description: 'Accessible label of the button that shows the sections of an item of the pathway',
  },
  hideItemOutline: {
    id: 'learning.pathways.outline.item.hide-outline',
    defaultMessage: 'Hide outline',
    description: 'Accessible label of the button that hides the sections of an item of the pathway',
  },
  resumeAlertTitle: {
    id: 'learning.pathways.outline.resume.alert.title',
    defaultMessage: 'Pick up where you left off',
    description: 'Title of the alert that invites the learner to continue the pathway where they left off',
  },
  resumeAlertBtn: {
    id: 'learning.pathways.outline.resume.alert.btn',
    defaultMessage: 'Resume {category}',
    description: 'Label of the button that takes the learner to where they left off in the pathway. {category} is the pathway category, e.g. Bootcamp',
  },
  achievementsAlertTitle: {
    id: 'learning.pathways.outline.achievements.alert.title',
    defaultMessage: 'Congratulations! You have achievements available.',
    description: 'Title of the alert that tells the learner they have earned achievements in the pathway',
  },
  achievementsAlertBtn: {
    id: 'learning.pathways.outline.achievements.alert.btn',
    defaultMessage: 'View achievements',
    description: 'Label of the button that takes the learner to the pathway achievements page',
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
  };
};
