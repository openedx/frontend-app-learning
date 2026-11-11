import { queryOptions, useQuery } from '@tanstack/react-query';

import { appId } from '@src/constants';
import { queryDefaults } from '@src/queryClient';
import { getCourseMetadata } from './api';
import type { CoursewareMeta } from './coursewareMeta';

const coursewareKey = [appId, 'courseware'] as const;

interface QueryOptions {
  enabled?: boolean;
}

export const coursewareMetadataQuery = (courseId: string) => queryOptions({
  ...queryDefaults,
  queryKey: [...coursewareKey, 'metadata', courseId] as const,
  queryFn: (): Promise<CoursewareMeta> => getCourseMetadata(courseId),
});

export const useCoursewareMetadata = (
  courseId: string | undefined,
  { enabled = true }: QueryOptions = {},
) => useQuery({
  ...coursewareMetadataQuery(courseId!),
  enabled: enabled && !!courseId,
});

type CoursewareQueryStub = (courseId: string | undefined, options?: QueryOptions) => { data: undefined };

// https://github.com/openedx/frontend-app-learning/issues/2195
export const useMinimalCourseOutline: CoursewareQueryStub = () => ({ data: undefined });
