import { useQuery } from '@tanstack/react-query';

import { getCourseMetadata, getLearningSequencesOutline, getSequenceMetadata } from './api';
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

export const useSequenceMetadata = (sequenceId: string | undefined, isPreview: boolean) => useQuery({
  queryKey: coursewareQueryKeys.sequence(sequenceId!, isPreview),
  queryFn: async () => {
    const { sequence, units } = await getSequenceMetadata(sequenceId, { preview: isPreview ? '1' : '0' });
    if (sequence.blockType !== 'sequential') {
      throw new Error(
        `Requested sequence '${sequenceId}' has block type '${sequence.blockType}'; expected block type 'sequential'.`,
      );
    }
    return { sequence, units };
  },
  enabled: !!sequenceId,
  retry: false,
  meta: {
    logStatusAs: { 422: 'silent' },
    models: [
      { modelType: 'sequences', strategy: 'updateModel', source: 'sequence' },
      { modelType: 'units', strategy: 'updateModels', source: 'units' },
    ],
  },
});
