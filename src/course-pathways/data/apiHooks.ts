import { getConfig } from '@edx/frontend-platform';
import { appId } from '@src/constants';
import { skipToken, useQuery } from '@tanstack/react-query';

import { getPathwaysByCourse } from './api';
import type { PathwayData } from './types';

export const coursePathwaysQueryKeys = {
  all: [appId, 'coursePathways'] as const,
  course: (courseId: string) => [...coursePathwaysQueryKeys.all, courseId] as const,
};

// Pathways in which the learner is enrolled that include the given course.
export const useCoursePathways = (courseId?: string) => useQuery({
  queryKey: coursePathwaysQueryKeys.course(courseId!),
  queryFn: getConfig().ENABLE_PATHWAY_PILOT_UI && courseId ? () => getPathwaysByCourse([courseId]) : skipToken,
  select: (pathwaysByCourse): PathwayData[] => pathwaysByCourse[courseId!] ?? [],
});
