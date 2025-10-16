import { getConfig } from '@edx/frontend-platform';

/* eslint-disable import/prefer-default-export */
export const showUngradedAssignments = () => (
  getConfig().SHOW_UNGRADED_ASSIGNMENT_PROGRESS === 'true'
  || getConfig().SHOW_UNGRADED_ASSIGNMENT_PROGRESS === true
);

export const getLatestDueDateInFuture = (assignmentTypeGradeSummary) => {
  let latest = null;
  assignmentTypeGradeSummary.forEach((assignment) => {
    const assignmentLastGradePublishDate = assignment.lastGradePublishDate;
    if (assignmentLastGradePublishDate && (!latest || new Date(assignmentLastGradePublishDate) > new Date(latest))
       && new Date(assignmentLastGradePublishDate) > new Date()) {
      latest = assignmentLastGradePublishDate;
    }
  });
  return latest;
};
