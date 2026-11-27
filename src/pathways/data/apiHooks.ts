import { logError } from '@edx/frontend-platform/logging';
import { appId } from '@src/constants';
import {
  skipToken, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';

import {
  getCourseOutline,
  getPathway,
  getPathwayAchievements,
  getPathwayItems,
  getPathwayProgress,
  getPathwaysByCourse,
  markPathwayAchievementsSeen,
} from './api';
import type { PathwayData } from './types';

export const coursePathwaysQueryKeys = {
  all: [appId, 'coursePathways'] as const,
  course: (courseId: string) => [...coursePathwaysQueryKeys.all, courseId] as const,
};

export const courseOutlineQueryKeys = {
  all: [appId, 'pathwayCourseOutline'] as const,
  course: (courseId: string) => [...courseOutlineQueryKeys.all, courseId] as const,
};

export const pathwayQueryKeys = {
  all: [appId, 'pathway'] as const,
  pathway: (pathwayId: string) => [...pathwayQueryKeys.all, pathwayId] as const,
  progress: (pathwayId: string) => [...pathwayQueryKeys.pathway(pathwayId), 'progress'] as const,
  achievements: (pathwayId: string) => [...pathwayQueryKeys.pathway(pathwayId), 'achievements'] as const,
  items: (pathwayId: string) => [...pathwayQueryKeys.pathway(pathwayId), 'items'] as const,
};

// Pathways in which the learner is enrolled that include the given course.
export const useCoursePathways = (courseId?: string) => useQuery({
  queryKey: coursePathwaysQueryKeys.course(courseId!),
  queryFn: courseId ? () => getPathwaysByCourse([courseId]) : skipToken,
  select: (pathwaysByCourse): PathwayData[] => pathwaysByCourse[courseId!] ?? [],
});

// The given pathway, with the learner's progress in it.
export const usePathway = (pathwayId?: string) => useQuery({
  queryKey: pathwayQueryKeys.pathway(pathwayId!),
  queryFn: pathwayId ? () => getPathway(pathwayId) : skipToken,
});

// The learner's progress in the given pathway.
export const usePathwayProgress = (pathwayId?: string) => useQuery({
  queryKey: pathwayQueryKeys.progress(pathwayId!),
  queryFn: pathwayId ? () => getPathwayProgress(pathwayId) : skipToken,
});

// The achievements the learner has earned in the given pathway.
export const usePathwayAchievements = (pathwayId?: string) => useQuery({
  queryKey: pathwayQueryKeys.achievements(pathwayId!),
  queryFn: pathwayId ? () => getPathwayAchievements(pathwayId) : skipToken,
});

// Records that the learner has seen their achievements in the given pathway. The pathway stops
// reporting new achievements right away, so the alert about them disappears without waiting
// for the request.
export const useMarkPathwayAchievementsSeen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pathwayId: string) => markPathwayAchievementsSeen(pathwayId),
    onMutate: (pathwayId) => {
      queryClient.setQueryData<PathwayData>(
        pathwayQueryKeys.pathway(pathwayId),
        (data) => (data?.progress
          ? { ...data, progress: { ...data.progress, hasNewAchievements: false } }
          : data),
      );
    },
    onError: (error, pathwayId) => {
      logError(error);
      // Brings back the real value from the backend
      queryClient.invalidateQueries({ queryKey: pathwayQueryKeys.pathway(pathwayId) });
    },
  });
};

// The items of the given pathway.
export const usePathwayItems = (pathwayId?: string) => useQuery({
  queryKey: pathwayQueryKeys.items(pathwayId!),
  queryFn: pathwayId ? () => getPathwayItems(pathwayId) : skipToken,
});

// The sections of the given course of a pathway, with their subsections.
export const useCourseOutline = (courseId?: string) => useQuery({
  queryKey: courseOutlineQueryKeys.course(courseId!),
  queryFn: courseId ? () => getCourseOutline(courseId) : skipToken,
});
