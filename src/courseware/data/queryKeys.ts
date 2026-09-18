import { appId } from '@src/constants';

export const coursewareQueryKeys = {
  all: [appId, 'courseware'] as const,
  metadata: (courseId: string) => [...coursewareQueryKeys.all, 'metadata', courseId] as const,
  outline: (courseId: string) => [...coursewareQueryKeys.all, 'outline', courseId] as const,
  sequence: (sequenceId: string, isPreview: boolean) => (
    [...coursewareQueryKeys.all, 'sequence', sequenceId, isPreview] as const
  ),
  courseOutline: (courseId: string) => [...coursewareQueryKeys.all, 'courseOutline', courseId] as const,
  discussionTopics: (courseId: string) => [...coursewareQueryKeys.all, 'discussionTopics', courseId] as const,
  sidebarToggles: (courseId: string) => [...coursewareQueryKeys.all, 'sidebarToggles', courseId] as const,
};
