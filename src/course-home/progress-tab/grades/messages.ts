import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  assignmentType: {
    id: 'progress.assignmentType',
    defaultMessage: 'Assignment type',
    description: 'Header for column that indicate type of the assignment in grade summary table',
  },
  backToContent: {
    id: 'progress.footnotes.backToContent',
    defaultMessage: 'Back to content',
    description: 'Text for button that redirects to contnet',
  },
  courseGradeBody: {
    id: 'progress.courseGrade.body',
    defaultMessage: 'This represents your weighted grade against the grade needed to pass this course.',
    description: 'This text is shown to explain the meaning of the (grade bar) chart',
  },
  courseGradeBarAltText: {
    id: 'progress.courseGrade.gradeBar.altText',
    defaultMessage: 'Your current grade is {currentGrade}%. A weighted grade of {passingGrade}% is required to pass in this course.',
    description: 'Alt text for the grade chart bar',
  },
  courseGradeFooterGenericPassing: {
    id: 'progress.courseGrade.footer.generic.passing',
    defaultMessage: 'You’re currently passing this course',
    description: 'This shown when learner weighted grade is greater or equal course passing grade',
  },
  courseGradeFooterNonPassing: {
    id: 'progress.courseGrade.footer.nonPassing',
    defaultMessage: 'A weighted grade of {passingGrade}% is required to pass in this course',
    description: 'This shown when learner weighted grade is less than course passing grade',
  },
  courseGradeFooterPassingWithGrade: {
    id: 'progress.courseGrade.footer.passing',
    defaultMessage: 'You’re currently passing this course with a grade of {letterGrade} ({minGrade}-{maxGrade}%)',
    description: 'This shown when learner weighted grade is greater or equal course passing grade amd course is using letter grade',
  },
  courseGradePreviewHeaderLocked: {
    id: 'progress.courseGrade.preview.headerLocked',
    defaultMessage: 'locked feature',
    description: 'This when (progress page) feature is locked, sometimes learner needs to upgrade to get insight about their progress',
  },
  courseGradePreviewHeaderLimited: {
    id: 'progress.courseGrade.preview.headerLimited',
    defaultMessage: 'limited feature',
    description: 'This when (progress page) feature is partially locked, it means leaners can see their progress but not get to a certificate',
  },
  courseGradePreviewHeaderAriaHidden: {
    id: 'progress.courseGrade.preview.header.ariaHidden',
    defaultMessage: 'Preview of a ',
    description: 'This text precedes either (locked feature) or (limited feature)',
  },
  courseGradePreviewUnlockCertificateBody: {
    id: 'progress.courseGrade.preview.body.unlockCertificate',
    defaultMessage: 'Unlock to view grades and work towards a certificate.',
    description: 'Recommending an action for learner when they need to upgrade to view progress and get a certificate',
  },
  courseGradePartialPreviewUnlockCertificateBody: {
    id: 'progress.courseGrade.partialpreview.body.unlockCertificate',
    defaultMessage: 'Unlock to work towards a certificate.',
    description: 'Recommending an action for learner when they need to upgrade to get a certificate',
  },
  courseGradePreviewUpgradeDeadlinePassedBody: {
    id: 'progress.courseGrade.preview.body.upgradeDeadlinePassed',
    defaultMessage: 'The deadline to upgrade in this course has passed.',
    description: 'Shown when learner no longer can upgrade',
  },
  courseGradePreviewUpgradeButton: {
    id: 'progress.courseGrade.preview.button.upgrade',
    defaultMessage: 'Upgrade now',
    description: 'Text for button that redirects to the upgrade page',
  },
  courseGradeRangeTooltip: {
    id: 'progress.courseGrade.gradeRange.tooltip',
    defaultMessage: 'Grade ranges for this course:',
    description: 'This shown when course is using (letter grade) to explain e.g. range for A, B, and C...etc',
  },
  courseOutline: {
    id: 'progress.courseOutline',
    defaultMessage: 'Course Outline',
    description: 'Anchor text for link that redirects to (course outline) tab',
  },
  currentGradeLabel: {
    id: 'progress.courseGrade.label.currentGrade',
    defaultMessage: 'Your current grade',
    description: 'Text label current leaner grade on (grade bar) chart',
  },
  detailedGrades: {
    id: 'progress.detailedGrades',
    defaultMessage: 'Detailed grades',
    description: 'Headline for the (detailed grade) section in the progress tab',
  },
  detailedGradesEmpty: {
    id: 'progress.detailedGrades.emptyTable',
    defaultMessage: 'You currently have no graded problem scores.',
    description: 'It indicate that there are no problem or assignments to be scored',
  },
  footnotesTitle: {
    id: 'progress.footnotes.title',
    defaultMessage: 'Grade summary footnotes',
    description: 'Title for grade summary footnotes, if exists',
  },
  grade: {
    id: 'progress.gradeSummary.grade',
    defaultMessage: 'Grade',
    description: 'Headline for (grade column) in grade summary table',
  },
  grades: {
    id: 'progress.courseGrade.grades',
    defaultMessage: 'Grades',
    description: 'Headline for grades section in progress tab',
  },
  gradesAndCredit: {
    id: 'progress.courseGrade.gradesAndCredit',
    defaultMessage: 'Grades & Credit',
    description: 'Headline for (grades and credit) section in progress tab',
  },
  gradeRangeTooltipAlt: {
    id: 'progress.courseGrade.gradeRange.Tooltip',
    defaultMessage: 'Grade range tooltip',
    description: 'Alt text for icon which that triggers (tip box) for grade range',
  },
  gradeSummary: {
    id: 'progress.gradeSummary',
    defaultMessage: 'Grade summary',
    description: 'Headline for the (grade summary) section in (grades) section in progress tab',
  },
  gradeSummaryLimitedAccessExplanation: {
    id: 'progress.gradeSummary.limitedAccessExplanation',
    defaultMessage: 'You have limited access to graded assignments as part of the audit track in this course.',
    description: 'Text shown when learner has limited access to grade feature',
  },
  gradeSummaryTooltipAlt: {
    id: 'progress.gradeSummary.tooltip.alt',
    defaultMessage: 'Grade summary tooltip',
    description: 'Alt text for icon which that triggers (tip box) for grade summary',
  },
  gradeSummaryTooltipBody: {
    id: 'progress.gradeSummary.tooltip.body',
    defaultMessage: "Your course assignment's weight is determined by your instructor. "
      + 'By multiplying your grade by the weight for that assignment type, your weighted grade is calculated. '
      + "Your weighted grade is what's used to determine if you pass the course.",
    description: 'The content of (tip box) for the grade summary section',
  },
  noAccessToAssignmentType: {
    id: 'progress.noAcessToAssignmentType',
    defaultMessage: 'You do not have access to assignments of type {assignmentType}',
    description: 'Its alt text for locked icon which is shown if assignment type in (grade summary table) is locked',
  },
  noAccessToSubsection: {
    id: 'progress.noAcessToSubsection',
    defaultMessage: 'You do not have access to subsection {displayName}',
    description: 'Text shown when learner have limited access to grades feature',
  },
  passingGradeLabel: {
    id: 'progress.courseGrade.label.passingGrade',
    defaultMessage: 'Passing grade',
    description: 'Label for mark on the (grade bar) chart which indicate the poisition of passing grade on the bar',
  },
  problemScoreLabel: {
    id: 'progress.detailedGrades.problemScore.label',
    defaultMessage: 'Problem Scores:',
    description: 'Label text which precedes detailed view of all scores per assignment',
  },
  problemScoreToggleAltText: {
    id: 'progress.detailedGrades.problemScore.toggleButton',
    defaultMessage: 'Toggle individual problem scores for {subsectionTitle}',
    description: 'Alt text for button which switches detailed view per module',
  },
  sectionGradeOverridden: {
    id: 'progress.detailedGrades.overridden',
    defaultMessage: 'Section grade has been overridden.',
    description: 'This indicate that the graded score has been changed, it can happen if leaner initial assessment was not fair, might be for other reasons as well',
  },
  score: {
    id: 'progress.score',
    defaultMessage: 'Score',
    description: 'It indicate how many points the learner have socred scored in particular assignment, or exam',
  },
  weight: {
    id: 'progress.weight',
    defaultMessage: 'Weight',
    description: 'It indicate the weight of particular assignment on overall course grade, it is demeterined by course author',
  },
  weightedGrade: {
    id: 'progress.weightedGrade',
    defaultMessage: 'Weighted grade',
    description: 'Weighed grade is calculated by (weight %) * (grade score) ',
  },
  weightedGradeSummary: {
    id: 'progress.weightedGradeSummary',
    defaultMessage: 'Your current weighted grade summary',
    description: 'It the text precede the sum of weighted grades of all the assignment',
  },

});

export default messages;
