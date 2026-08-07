import { useQuery } from '@tanstack/react-query';

import { getCourseRecommendations } from './api';
import { recommendationsQueryKeys } from './queryKeys';

export const useCourseRecommendations = (courseKey: string) => useQuery({
  queryKey: recommendationsQueryKeys.list(courseKey),
  queryFn: () => getCourseRecommendations(courseKey),
});
