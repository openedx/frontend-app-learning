import { appId } from '@src/constants';

export const recommendationsQueryKeys = {
  all: [appId, 'recommendations'] as const,
  list: (courseKey: string) => [...recommendationsQueryKeys.all, courseKey] as const,
};
