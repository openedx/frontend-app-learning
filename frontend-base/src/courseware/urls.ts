import { resolveRouteByRole } from '@openedx/frontend-base';

import { coursewareRole } from '@src/constants';

export const getSequenceUrl = (courseId: string, sequenceId: string) => {
  const courseware = resolveRouteByRole(coursewareRole, { courseId });
  if (!courseware) {
    throw new Error(`No route provides the role ${coursewareRole}`);
  }
  return `${courseware.url}/${sequenceId}`;
};
