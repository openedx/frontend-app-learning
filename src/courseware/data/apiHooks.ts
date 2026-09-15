import { useCallback } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch, useStore } from 'react-redux';

import { updateModel } from '@src/generic/model-store';
import {
  getBlockCompletion, getCourseMetadata, getLearningSequencesOutline, getSequenceMetadata,
} from './api';
import { coursewareQueryKeys } from './queryKeys';
import { updateCourseOutlineCompletion } from './slice';

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

// courseId / sequenceId come from the still-untyped Redux slice at both call sites, so
// they are nullable here until those readers convert (#1976).
interface CheckBlockCompletionVars {
  courseId: string | null;
  sequenceId: string | null;
  unitId?: string;
}

export const useCheckBlockCompletion = () => {
  const store = useStore();
  const dispatch = useDispatch();
  const { mutate } = useMutation({
    mutationFn: ({ courseId, sequenceId, unitId }: CheckBlockCompletionVars) => (
      getBlockCompletion(courseId, sequenceId, unitId)
    ),
    onSuccess: (isComplete: boolean, { sequenceId, unitId }) => {
      dispatch(updateModel({ modelType: 'units', model: { id: unitId, complete: isComplete } }));
      try {
        dispatch(updateCourseOutlineCompletion({ sequenceId, unitId, isComplete }));
      } catch (error) {
        logError(error as Error); // the reducer throws when the sidebar outline isn't loaded
      }
    },
    onError: (error) => logError(error),
  });

  return useCallback((courseId: string | null, sequenceId: string | null, unitId?: string) => {
    const { units } = (store.getState() as { models: { units?: Record<string, { complete?: boolean }> } }).models;
    if (unitId && units?.[unitId]?.complete) {
      return; // things don't get uncompleted after they are completed
    }
    mutate({ courseId, sequenceId, unitId });
  }, [store, mutate]);
};
