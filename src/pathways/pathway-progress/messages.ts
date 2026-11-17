import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  progressTitle: {
    id: 'learning.pathways.progress.title',
    defaultMessage: 'Your Progress',
    description: 'Title of the progress section in the progress page',
  },
  gradesTitle: {
    id: 'learning.pathways.progress.grades.title',
    defaultMessage: 'Grades',
    description: 'Title of the grades section in the progress page',
  },
  gradesCourseColumn: {
    id: 'learning.pathways.progress.grades.table.course',
    defaultMessage: 'Course',
    description: 'Label for the Course column in the grades table',
  },
  gradesProgressColumn: {
    id: 'learning.pathways.progress.grades.table.progress',
    defaultMessage: 'Progress',
    description: 'Label for the Progress column in the grades table',
  },
  gradesPassGradeColumn: {
    id: 'learning.pathways.progress.grades.table.pass-grade',
    defaultMessage: 'Pass Grade',
    description: 'Label for the Pass Grade column in the grades table',
  },
  gradesCurrentGradeColumn: {
    id: 'learning.pathways.progress.grades.table.current-grade',
    defaultMessage: 'Current Grade',
    description: 'Label for the Current Grade column in the grades table',
  },
  gradesActionsColumn: {
    id: 'learning.pathways.progress.grades.table.actions',
    defaultMessage: 'Actions',
    description: 'Accessible label for the column of the grades table with the View details links. It is not shown on screen',
  },
  gradesViewDetails: {
    id: 'learning.pathways.progress.grades.table.view-details',
    defaultMessage: 'View details',
    description: 'Label for the View details links in the grades table',
  },
  gradesViewDetailsFor: {
    id: 'learning.pathways.progress.grades.table.view-details-for',
    defaultMessage: 'View details for {courseName}',
    description: 'Accessible label for the View details links in the grades table',
  },
  achievementsInfoEmptyTitle: {
    id: 'learning.pathways.progress.achievements-info.empty.title',
    defaultMessage: 'No achievements earned',
    description: 'Title of the empty state of the achievements info card',
  },
  achievementsInfoEmptyDescription: {
    id: 'learning.pathways.progress.achievements-info.empty.description',
    defaultMessage: 'No certificates earned yet.',
    description: 'Description of the empty state of the achievements info card',
  },
  achievementsInfoTitle: {
    id: 'learning.pathways.progress.achievements-info.title',
    defaultMessage: 'Achievements available',
    description: 'Title of the achievements info card',
  },
  achievementsInfoDescription: {
    id: 'learning.pathways.progress.achievements-info.description',
    defaultMessage: "Showcase your certificates on LinkedIn, or your resume today. Access your {categoryLabel}'s achievements below.",
    description: 'Description of the achievements info card',
  },
  achievementsInfoButton: {
    id: 'learning.pathways.progress.achievements-info.button',
    defaultMessage: 'View achievements',
    description: 'Label of the button of the achievements info card',
  },
});

export default messages;
