import { queryOptions, useQuery } from '@tanstack/react-query';

import { appId } from '@src/constants';
import { queryDefaults } from '@src/queryClient';
import { getCourseRecommendations } from './api';

const recommendationsKey = [appId, 'recommendations'] as const;

export const courseRecommendationsQuery = (courseKey: string) => queryOptions({
  ...queryDefaults,
  queryKey: [...recommendationsKey, courseKey] as const,
  queryFn: () => getCourseRecommendations(courseKey),
});

export const useCourseRecommendations = (courseKey: string) => useQuery(courseRecommendationsQuery(courseKey));
