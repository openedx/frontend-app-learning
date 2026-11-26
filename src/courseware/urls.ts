import { getUrlByRouteRole, resolveRouteByRole } from '@openedx/frontend-base';

import { courseOutlineRole, coursewareRole, learningRole } from '@src/constants';

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

export const getCourseExitUrl = (courseId: string) => `${getCoursewareUrl(courseId)}/course-end`;

// A courseware page, under the /preview prefix when `isPreview`. The preview routes (previewCoursewareRoutes in
// routes.tsx) exist for the sequence and unit shapes only; the course root has none, so it is never prefixed.
export const getCoursewarePath = (isPreview: boolean, courseId: string, sequenceId?: string, unitId?: string) => {
  if (!sequenceId) {
    return getCoursewareUrl(courseId);
  }
  if (isPreview) {
    const ids = unitId ? `${sequenceId}/${unitId}` : sequenceId;
    return `${getUrlByRouteRole(learningRole)}/preview/course/${courseId}/${ids}`;
  }
  return unitId ? getUnitUrl(courseId, sequenceId, unitId) : getSequenceUrl(courseId, sequenceId);
};
