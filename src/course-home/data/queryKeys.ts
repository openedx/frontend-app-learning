import { appId } from '@src/constants';

export const courseHomeQueryKeys = {
  all: [appId, 'courseHome'] as const,
  metadata: (courseId: string) => [...courseHomeQueryKeys.all, 'metadata', courseId] as const,
  datesTab: (courseId: string) => [...courseHomeQueryKeys.all, 'datesTab', courseId] as const,
  outlineTab: (courseId: string) => [...courseHomeQueryKeys.all, 'outlineTab', courseId] as const,
};
