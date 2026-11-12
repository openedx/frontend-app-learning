import { getAppConfig } from '@openedx/frontend-base';

import { appId } from '@src/constants';

export const showUngradedAssignments = () => (
  getAppConfig(appId).SHOW_UNGRADED_ASSIGNMENT_PROGRESS === 'true'
  || getAppConfig(appId).SHOW_UNGRADED_ASSIGNMENT_PROGRESS === true
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
