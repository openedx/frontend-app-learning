import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import {
  noop, useMutation, useQuery, useQueryClient, type QueryClient,
} from '@tanstack/react-query';
import { useDispatch, useStore } from 'react-redux';

import { getResponseStatus } from '@src/data/http-error';
import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { updateModel, useModel, useModels } from '@src/generic/model-store';
import {
  getBlockCompletion, getCourseDiscussionConfig, getCourseMetadata, getCourseOutline,
  getCoursewareOutlineSidebarToggles, getCourseTopics, getLearningSequencesOutline, getSequenceMetadata,
  postIntegritySignature, postSequencePosition,
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

export const useIsCourseLoaded = (courseId: string | undefined): boolean => {
  const metadataQuery = useCoursewareMetadata(courseId);
  const outlineQuery = useCoursewareOutline(courseId);
  const courseHomeMetaQuery = useCourseHomeMeta(courseId, 'courseware');
  return metadataQuery.isSuccess && courseHomeMetaQuery.isSuccess
    && !!courseHomeMetaQuery.data?.courseAccess?.hasAccess && outlineQuery.isSuccess;
};

export const useSequenceIds = (courseId: string | undefined): string[] => {
  const isCourseLoaded = useIsCourseLoaded(courseId);
  const { sectionIds = [] } = useModel('coursewareMeta', courseId);
  const sections = useModels('sections', isCourseLoaded ? sectionIds : []);
  return useMemo(
    () => sections.flatMap((section: { sequenceIds: string[] }) => section.sequenceIds),
    [sections],
  );
};

export const useSequenceMetadata = (sequenceId: string | undefined) => {
  const isPreview = useLocation().pathname.startsWith('/preview');
  return useQuery({
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
};

// A 422 from the sequence query means the requested id is not a sequence — it may be a unit id.
export const sequenceMightBeUnit = (sequenceQuery: { error: unknown }): boolean => (
  getResponseStatus(sequenceQuery.error) === 422
);

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

// Not a hook: the sole consumer is the widget-registry prefetch effect in
// SidebarContextProvider, which passes its own queryClient.
export const prefetchDiscussionTopics = (queryClient: QueryClient, courseId: string) => (
  queryClient.query({
    queryKey: coursewareQueryKeys.discussionTopics(courseId),
    queryFn: async () => {
      const config: { provider: string } = await getCourseDiscussionConfig(courseId);
      // Only load topics for the openedx provider, the legacy provider uses
      // the xblock
      if (config.provider !== 'openedx') {
        return [];
      }
      const topics: { usageKey: string | null }[] = await getCourseTopics(courseId);
      return topics.filter(topic => topic.usageKey);
    },
    meta: { models: [{ modelType: 'discussionTopics', strategy: 'updateModels', idField: 'usageKey' }] },
  }).catch(noop)
);

interface CheckBlockCompletionVars {
  courseId: string | undefined;
  sequenceId: string | undefined;
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

  return useCallback((courseId: string | undefined, sequenceId: string | undefined, unitId?: string) => {
    const { units } = (store.getState() as { models: { units?: Record<string, { complete?: boolean }> } }).models;
    if (unitId && units?.[unitId]?.complete) {
      return; // things don't get uncompleted after they are completed
    }
    mutate({ courseId, sequenceId, unitId });
  }, [store, mutate]);
};

interface SaveSequencePositionVars {
  courseId: string | undefined;
  sequenceId: string | undefined;
  activeUnitIndex: number;
}

export const useSaveSequencePosition = () => {
  const store = useStore();
  const dispatch = useDispatch();
  const setPosition = (sequenceId: string | undefined, activeUnitIndex: number) => {
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

  return useCallback((courseId: string | undefined, sequenceId: string | undefined, activeUnitIndex: number) => {
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
