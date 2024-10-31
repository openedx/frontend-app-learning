import { getConfig } from '@edx/frontend-platform';

/* eslint-disable import/prefer-default-export */
export const showUngradedAssignments = () => (
  getConfig().SHOW_UNGRADED_ASSIGNMENT_PROGRESS === 'true'
  || getConfig().SHOW_UNGRADED_ASSIGNMENT_PROGRESS === true
);
