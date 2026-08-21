import { appId } from '@src/constants';

export const courseHomeQueryKeys = {
  all: [appId, 'courseHome'] as const,
  metadata: (courseId: string, rootSlug: string) => [...courseHomeQueryKeys.all, 'metadata', courseId, rootSlug] as const,
  datesTab: (courseId: string) => [...courseHomeQueryKeys.all, 'datesTab', courseId] as const,
  outlineTab: (courseId: string) => [...courseHomeQueryKeys.all, 'outlineTab', courseId] as const,
  liveTab: (courseId: string) => [...courseHomeQueryKeys.all, 'liveTab', courseId] as const,
  progressTab: (courseId: string, targetUserId?: string) => [...courseHomeQueryKeys.all, 'progressTab', courseId, targetUserId] as const,
};
