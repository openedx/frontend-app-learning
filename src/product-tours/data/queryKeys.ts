import { appId } from '@src/constants';

export const tourQueryKeys = {
  all: [appId, 'tours'] as const,
  user: (username: string) => [...tourQueryKeys.all, username] as const,
};
