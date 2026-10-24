import { appId } from '@src/constants';
import type { RequestError } from '@src/data/http-error';
import { skipToken, useQuery } from '@tanstack/react-query';

import { getPathway, getPathwaysByCourse } from './api';
import type { PathwayData } from './types';

export const coursePathwaysQueryKeys = {
  all: [appId, 'coursePathways'] as const,
  course: (courseId: string) => [...coursePathwaysQueryKeys.all, courseId] as const,
};

export const pathwayQueryKeys = {
  all: [appId, 'pathway'] as const,
  pathway: (pathwayId: string) => [...pathwayQueryKeys.all, pathwayId] as const,
};

// Pathways in which the learner is enrolled that include the given course.
export const useCoursePathways = (courseId?: string) => useQuery({
  queryKey: coursePathwaysQueryKeys.course(courseId!),
  queryFn: courseId ? () => getPathwaysByCourse([courseId]) : skipToken,
  select: (pathwaysByCourse): PathwayData[] => pathwaysByCourse[courseId!] ?? [],
});

// The given pathway, with the learner's progress in it.
export const usePathway = (pathwayId?: string) => useQuery<PathwayData, RequestError>({
  queryKey: pathwayQueryKeys.pathway(pathwayId!),
  queryFn: pathwayId ? () => getPathway(pathwayId) : skipToken,
});
