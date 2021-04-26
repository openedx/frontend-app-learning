import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  assignmentType: {
    id: 'progress.assignmentType',
    defaultMessage: 'Assignment type',
  },
  backToContent: {
    id: 'progress.footnotes.backToContent',
    defaultMessage: 'Back to content',
  },
  courseOutline: {
    id: 'progress.courseOutline',
    defaultMessage: 'Course Outline',
  },
  detailedGrades: {
    id: 'progress.detailedGrades',
    defaultMessage: 'Detailed grades',
  },
  detailedGradesEmpty: {
    id: 'progress.detailedGrades.emptyTable',
    defaultMessage: 'You currently have no graded problem scores.',
  },
  footnotesTitle: {
    id: 'progress.footnotes.title',
    defaultMessage: 'Grade summary footnotes',
  },
  gradeSummary: {
    id: 'progress.gradeSummary',
    defaultMessage: 'Grade summary',
  },
  gradeSummaryTooltip: {
    id: 'progress.gradeSummary.tooltip',
    defaultMessage: "Your course assignment's weight is determined by your instructor. "
      + 'By multiplying your score by the weight for that assignment type, your weighted grade is calculated. '
      + "Your weighted grade is what's used to determine if you pass the course.",
  },
  score: {
    id: 'progress.score',
    defaultMessage: 'Score',
  },
  weight: {
    id: 'progress.weight',
    defaultMessage: 'Weight',
  },
  weightedGrade: {
    id: 'progress.weightedGrade',
    defaultMessage: 'Weighted grade',
  },
  weightedGradeSummary: {
    id: 'progress.weightedGradeSummary',
    defaultMessage: 'Your current weighted grade summary',
  },
});

export default messages;
