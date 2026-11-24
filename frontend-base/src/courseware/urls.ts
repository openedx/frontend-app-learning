import { resolveRouteByRole } from '@openedx/frontend-base';

import { courseOutlineRole, coursewareRole } from '@src/constants';

const getRoleUrl = (role: string, courseId: string) => {
  const route = resolveRouteByRole(role, { courseId });
  if (!route) {
    throw new Error(`No route provides the role ${role}`);
  }
  return route.url;
};

export const getCourseOutlineUrl = (courseId: string) => getRoleUrl(courseOutlineRole, courseId);

export const getCoursewareUrl = (courseId: string) => getRoleUrl(coursewareRole, courseId);

export const getSequenceUrl = (courseId: string, sequenceId: string) => (
  `${getCoursewareUrl(courseId)}/${sequenceId}`
);

export const getUnitUrl = (courseId: string, sequenceId: string, unitId: string) => (
  `${getSequenceUrl(courseId, sequenceId)}/${unitId}`
);
