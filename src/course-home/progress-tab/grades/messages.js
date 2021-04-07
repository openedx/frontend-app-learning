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
  courseGradeBody: {
    id: 'progress.courseGrade.body',
    defaultMessage: 'This represents your weighted grade against the grade needed to pass this course.',
  },
  courseGradeBarAltText: {
    id: 'progress.courseGrade.gradeBar.altText',
    defaultMessage: 'Your current grade is {currentGrade}%. A weighted grade of {passingGrade}% is required to pass in this course.',
  },
  courseGradeFooterGenericPassing: {
    id: 'progress.courseGrade.footer.generic.passing',
    defaultMessage: 'You’re currently passing this course',
  },
  courseGradeFooterNonPassing: {
    id: 'progress.courseGrade.footer.nonPassing',
    defaultMessage: 'A weighted grade of {passingGrade}% is required to pass in this course',
  },
  courseGradeFooterPassingWithGrade: {
    id: 'progress.courseGrade.footer.passing',
    defaultMessage: 'You’re currently passing this course with a grade of {letterGrade} ({minGrade}-{maxGrade}%)',
  },
  courseGradeRangeTooltip: {
    id: 'progress.courseGrade.gradeRange.tooltip',
    defaultMessage: 'Grade ranges for this course:',
  },
  courseOutline: {
    id: 'progress.courseOutline',
    defaultMessage: 'Course Outline',
  },
  currentGradeLabel: {
    id: 'progress.courseGrade.label.currentGrade',
    defaultMessage: 'Your current grade',
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
  grades: {
    id: 'progress.courseGrade.grades',
    defaultMessage: 'Grades',
  },
  gradeRangeTooltipAlt: {
    id: 'progress.courseGrade.gradeRange.Tooltip',
    defaultMessage: 'Grade range tooltip',
  },
  gradeSummary: {
    id: 'progress.gradeSummary',
    defaultMessage: 'Grade summary',
  },
  gradeSummaryTooltipAlt: {
    id: 'progress.gradeSummary.tooltip.alt',
    defaultMessage: 'Grade summary tooltip',
  },
  gradeSummaryTooltipBody: {
    id: 'progress.gradeSummary.tooltip.body',
    defaultMessage: "Your course assignment's weight is determined by your instructor. "
      + 'By multiplying your score by the weight for that assignment type, your weighted grade is calculated. '
      + "Your weighted grade is what's used to determine if you pass the course.",
  },
  passingGradeLabel: {
    id: 'progress.courseGrade.label.passingGrade',
    defaultMessage: 'Passing grade',
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
