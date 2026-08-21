import { useQuery } from '@tanstack/react-query';

import { getCoursewareSearchEnabled, searchCourseContentFromAPI } from '../../data/api';
import mapSearchResponse from '../map-search-response';
import { coursewareSearchQueryKeys } from './queryKeys';

export const useCoursewareSearchEnabled = (courseId: string) => useQuery({
  queryKey: coursewareSearchQueryKeys.enabled(courseId),
  queryFn: () => getCoursewareSearchEnabled(courseId),
});

export const useCoursewareSearchResults = (courseId: string, keyword: string) => useQuery({
  queryKey: coursewareSearchQueryKeys.results(courseId, keyword),
  queryFn: async () => {
    const { data } = await searchCourseContentFromAPI(courseId, keyword);
    return mapSearchResponse(data, keyword);
  },
  enabled: !!keyword,
});
