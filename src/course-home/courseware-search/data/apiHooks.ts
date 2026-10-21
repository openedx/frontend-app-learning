import { queryOptions, useQuery } from '@tanstack/react-query';

import { appId } from '@src/constants';
import { getCoursewareSearchEnabled, searchCourseContentFromAPI } from '../../data/api';
import mapSearchResponse from '../map-search-response';

const coursewareSearchKey = [appId, 'coursewareSearch'] as const;

export const coursewareSearchEnabledQuery = (courseId: string) => queryOptions({
  queryKey: [...coursewareSearchKey, 'enabled', courseId] as const,
  queryFn: () => getCoursewareSearchEnabled(courseId),
});

export const useCoursewareSearchEnabled = (courseId: string) => useQuery(coursewareSearchEnabledQuery(courseId));

export const coursewareSearchResultsQuery = (courseId: string, keyword: string) => queryOptions({
  queryKey: [...coursewareSearchKey, 'results', courseId, keyword] as const,
  queryFn: async () => {
    const { data } = await searchCourseContentFromAPI(courseId, keyword);
    return mapSearchResponse(data, keyword);
  },
});

export const useCoursewareSearchResults = (courseId: string, keyword: string) => useQuery({
  ...coursewareSearchResultsQuery(courseId, keyword),
  enabled: !!keyword,
});
