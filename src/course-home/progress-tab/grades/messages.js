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
  courseGradePreviewHeaderLocked: {
    id: 'progress.courseGrade.preview.headerLocked',
    defaultMessage: 'locked feature',
  },
  courseGradePreviewHeaderLimited: {
    id: 'progress.courseGrade.preview.headerLimited',
    defaultMessage: 'limited feature',
  },
  courseGradePreviewHeaderAriaHidden: {
    id: 'progress.courseGrade.preview.header.ariaHidden',
    defaultMessage: 'Preview of a ',
  },
  courseGradePreviewUnlockCertificateBody: {
    id: 'progress.courseGrade.preview.body.unlockCertificate',
    defaultMessage: 'Unlock to view grades and work towards a certificate.',
  },
  courseGradePartialPreviewUnlockCertificateBody: {
    id: 'progress.courseGrade.partialpreview.body.unlockCertificate',
    defaultMessage: 'Unlock to work towards a certificate.',
  },
  courseGradePreviewUpgradeDeadlinePassedBody: {
    id: 'progress.courseGrade.preview.body.upgradeDeadlinePassed',
    defaultMessage: 'The deadline to upgrade in this course has passed.',
  },
  courseGradePreviewUpgradeButton: {
    id: 'progress.courseGrade.preview.button.upgrade',
    defaultMessage: 'Upgrade now',
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
  grade: {
    id: 'progress.gradeSummary.grade',
    defaultMessage: 'Grade',
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
  gradeSummaryLimitedAccessExplanation: {
    id: 'progress.gradeSummary.limitedAccessExplanation',
    defaultMessage: 'You have limited access to graded assignments as part of the audit track in this course.',
  },
  gradeSummaryTooltipAlt: {
    id: 'progress.gradeSummary.tooltip.alt',
    defaultMessage: 'Grade summary tooltip',
  },
  gradeSummaryTooltipBody: {
    id: 'progress.gradeSummary.tooltip.body',
    defaultMessage: "Your course assignment's weight is determined by your instructor. "
      + 'By multiplying your grade by the weight for that assignment type, your weighted grade is calculated. '
      + "Your weighted grade is what's used to determine if you pass the course.",
  },
  passingGradeLabel: {
    id: 'progress.courseGrade.label.passingGrade',
    defaultMessage: 'Passing grade',
  },
  problemScoreLabel: {
    id: 'progress.detailedGrades.problemScore.label',
    defaultMessage: 'Problem Scores:',
  },
  problemScoreToggleAltText: {
    id: 'progress.detailedGrades.problemScore.toggleButton',
    defaultMessage: 'Toggle individual problem scores for {subsectionTitle}',
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
  noAccessToAssignmentType: {
    id: 'progress.noAcessToAssignmentType',
    defaultMessage: 'You do not have access to assignments of type {assignmentType}',
  },
  noAccessToSubsection: {
    id: 'progress.noAcessToSubsection',
    defaultMessage: 'You do not have access to subsection {displayName}',
  },
});

export default messages;
