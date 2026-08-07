import { appId } from '@src/constants';

export const coursewareSearchQueryKeys = {
  all: [appId, 'coursewareSearch'] as const,
  enabled: (courseId: string) => [...coursewareSearchQueryKeys.all, 'enabled', courseId] as const,
  results: (courseId: string, keyword: string) => [...coursewareSearchQueryKeys.all, 'results', courseId, keyword] as const,
};
