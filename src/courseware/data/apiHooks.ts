import { useQuery } from '@tanstack/react-query';

import { getCourseMetadata, getLearningSequencesOutline } from './api';
import { coursewareQueryKeys } from './queryKeys';

export const useCoursewareMetadata = (courseId: string | undefined) => useQuery({
  queryKey: coursewareQueryKeys.metadata(courseId!),
  queryFn: () => getCourseMetadata(courseId),
  enabled: !!courseId,
  meta: { models: [{ modelType: 'coursewareMeta', strategy: 'updateModel' }] },
});

export const useCoursewareOutline = (courseId: string | undefined) => useQuery({
  queryKey: coursewareQueryKeys.outline(courseId!),
  queryFn: () => getLearningSequencesOutline(courseId),
  enabled: !!courseId,
  meta: {
    logStatusAs: { 403: 'info' },
    models: [
      { modelType: 'coursewareMeta', strategy: 'updateModelsMap', source: 'courses' },
      { modelType: 'sections', strategy: 'addModelsMap', source: 'sections' },
      { modelType: 'sequences', strategy: 'updateModelsMap', source: 'sequences' },
    ],
  },
});
