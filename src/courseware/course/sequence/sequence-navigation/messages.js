import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  completeCourseButton: {
    id: 'learn.sequence.navigation.complete.button',
    defaultMessage: 'Complete the course',
    description: 'Button to advance to the course completion page',
  },
  endOfCourse: {
    id: 'learn.end.of.course',
    defaultMessage: "You've reached the end of this course!",
  },
  nextButton: {
    id: 'learn.sequence.navigation.next.button',
    defaultMessage: 'Next',
    description: 'Button to advance to the next section',
  },
  previousButton: {
    id: 'learn.sequence.navigation.previous.button',
    defaultMessage: 'Previous',
    description: 'Button to return to the previous section',
  },
});

export default messages;
