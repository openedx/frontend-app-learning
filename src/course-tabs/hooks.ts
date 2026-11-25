import { resolveRouteByRole } from '@openedx/frontend-base';

import { courseDatesRole, courseOutlineRole, courseProgressRole } from '@src/constants';
import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { hasCourseOutlineTab, hasDatesTab, hasProgressTab } from './utils';
import { useCourseId } from '@src/generic/course-params';

const useTabs = () => {
  const courseId = useCourseId();
  return useCourseHomeMeta(courseId, { enabled: false }).data?.tabs;
};

const useTabUrl = (hasTab: boolean, role: string) => {
  const courseId = useCourseId();
  if (!hasTab || !courseId) {
    return undefined;
  }
  return resolveRouteByRole(role, { courseId })?.url;
};

export const useCourseOutlineUrl = () => useTabUrl(hasCourseOutlineTab(useTabs()), courseOutlineRole);
export const useDatesTabUrl = () => useTabUrl(hasDatesTab(useTabs()), courseDatesRole);
export const useProgressTabUrl = () => useTabUrl(hasProgressTab(useTabs()), courseProgressRole);
