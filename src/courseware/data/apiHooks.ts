import { useCallback } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useStore } from 'react-redux';

import { updateModel } from '@src/generic/model-store';
import {
  getBlockCompletion, getCourseMetadata, getCourseOutline, getCoursewareOutlineSidebarToggles,
  getLearningSequencesOutline, getSequenceMetadata, postIntegritySignature, postSequencePosition,
} from './api';
import { applyUnitCompletion, type CourseOutlineData } from './courseOutline';
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

export const useCourseOutlineStructure = (courseId: string | undefined) => useQuery<CourseOutlineData | null>({
  queryKey: coursewareQueryKeys.courseOutline(courseId!),
  queryFn: () => getCourseOutline(courseId!),
  enabled: !!courseId,
  // Observed by every outline row; only invalidation should refetch:
  staleTime: Infinity,
});

export const useCoursewareOutlineSidebarToggles = (courseId: string | undefined) => useQuery({
  queryKey: coursewareQueryKeys.sidebarToggles(courseId!),
  queryFn: async () => {
    const {
      enable_completion_tracking: enableCompletionTracking,
    } = await getCoursewareOutlineSidebarToggles(courseId!);
    return { enableCompletionTracking };
  },
  enabled: !!courseId,
  // Observed by every outline row and never changes mid-session:
  staleTime: Infinity,
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
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ courseId, sequenceId, unitId }: CheckBlockCompletionVars) => (
      getBlockCompletion(courseId, sequenceId, unitId)
    ),
    onSuccess: (isComplete: boolean, { courseId, unitId }) => {
      dispatch(updateModel({ modelType: 'units', model: { id: unitId, complete: isComplete } }));
      if (!isComplete || !unitId || !courseId) {
        return;
      }
      const queryKey = coursewareQueryKeys.courseOutline(courseId);
      const cachedOutline = queryClient.getQueryData<CourseOutlineData | null>(queryKey);
      if (!cachedOutline) {
        return; // sidebar outline never fetched (e.g. never opened)
      }
      const { outline, refetchNeeded } = applyUnitCompletion(cachedOutline, unitId);
      queryClient.setQueryData(queryKey, outline);
      if (refetchNeeded) {
        queryClient.invalidateQueries({ queryKey });
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

// courseId / sequenceId come from the still-untyped Redux slice at the call site, so
// they are nullable here until that reader converts (#1976).
interface SaveSequencePositionVars {
  courseId: string | null;
  sequenceId: string | null;
  activeUnitIndex: number;
}

export const useSaveSequencePosition = () => {
  const store = useStore();
  const dispatch = useDispatch();
  const setPosition = (sequenceId: string | null, activeUnitIndex: number) => {
    dispatch(updateModel({ modelType: 'sequences', model: { id: sequenceId, activeUnitIndex } }));
  };
  const { mutate } = useMutation({
    mutationFn: ({ courseId, sequenceId, activeUnitIndex }: SaveSequencePositionVars) => (
      postSequencePosition(courseId, sequenceId, activeUnitIndex)
    ),
    onMutate: ({ sequenceId, activeUnitIndex }) => {
      const { models } = store.getState() as { models: { sequences: Record<string, { activeUnitIndex: number }> } };
      const initialActiveUnitIndex = models.sequences[sequenceId!].activeUnitIndex;
      // Optimistically update the position.
      setPosition(sequenceId, activeUnitIndex);
      return { initialActiveUnitIndex };
    },
    onSuccess: (_data, { sequenceId, activeUnitIndex }) => {
      // Update again under the assumption that the above call succeeded, since it doesn't return a
      // meaningful response.
      setPosition(sequenceId, activeUnitIndex);
    },
    onError: (error, { sequenceId }, context) => {
      logError(error);
      setPosition(sequenceId, context!.initialActiveUnitIndex);
    },
  });

  return useCallback((courseId: string | null, sequenceId: string | null, activeUnitIndex: number) => {
    mutate({ courseId, sequenceId, activeUnitIndex });
  }, [mutate]);
};

interface SaveIntegritySignatureVars {
  courseId: string;
  isMasquerading: boolean;
}

export const useSaveIntegritySignature = () => {
  const dispatch = useDispatch();
  const { mutate } = useMutation({
    // If the request is made by a staff user masquerading as a specific learner,
    // don't actually create a signature for them on the backend,
    // only the modal dialog will be dismissed
    mutationFn: async ({ courseId, isMasquerading }: SaveIntegritySignatureVars) => (
      isMasquerading ? null : postIntegritySignature(courseId)
    ),
    onSuccess: (_data, { courseId }) => {
      dispatch(updateModel({
        modelType: 'coursewareMeta',
        model: {
          id: courseId,
          userNeedsIntegritySignature: false,
        },
      }));
    },
    onError: (error) => logError(error),
  });

  return useCallback((courseId: string, isMasquerading: boolean) => {
    mutate({ courseId, isMasquerading });
  }, [mutate]);
};
