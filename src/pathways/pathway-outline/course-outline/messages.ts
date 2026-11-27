import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loading: {
    id: 'learning.pathways.outline.course-outline.loading',
    defaultMessage: 'Loading course outline…',
    description: 'Screen reader text while the sections of a course of the pathway are loading',
  },
  failure: {
    id: 'learning.pathways.outline.course-outline.failure',
    defaultMessage: 'There was an error loading the outline of this course.',
    description: 'Shown when the sections of a course of the pathway fail to load',
  },
  completedSection: {
    id: 'learning.pathways.outline.course-outline.section.completed',
    defaultMessage: 'Completed section',
    description: 'Screen reader text for a section of the course the learner has completed',
  },
  incompleteSection: {
    id: 'learning.pathways.outline.course-outline.section.incomplete',
    defaultMessage: 'Incomplete section',
    description: 'Screen reader text for a section of the course the learner has not completed',
  },
  completedSubsection: {
    id: 'learning.pathways.outline.course-outline.subsection.completed',
    defaultMessage: 'Completed',
    description: 'Screen reader text for a subsection of the course the learner has completed',
  },
  incompleteSubsection: {
    id: 'learning.pathways.outline.course-outline.subsection.incomplete',
    defaultMessage: 'Incomplete',
    description: 'Screen reader text for a subsection of the course the learner has not completed',
  },
});

export default messages;
