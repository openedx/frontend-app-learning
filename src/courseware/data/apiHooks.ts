import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import {
  type QueryClient, queryOptions, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';

import { getResponseStatus } from '@src/data/http-error';
import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import {
  getBlockCompletion, getCourseDiscussionConfig, getCourseMetadata, getCourseOutline,
  getCoursewareOutlineSidebarToggles, getCourseTopics, getLearningSequencesOutline, getSequenceMetadata,
  postIntegritySignature, postSequencePosition,
} from './api';
import { applyUnitCompletion, type CourseNavigationOutline } from './courseNavigationOutline';
import type { CoursewareMeta } from './coursewareMeta';
import type { MinimalCourseOutline } from './minimalCourseOutline';
import { coursewareQueryKeys } from './queryKeys';
import type { SequenceMetadataData, SequenceUnit } from './sequenceMetadata';

interface QueryOptions {
  enabled?: boolean;
}

export const useCoursewareMetadata = (
  courseId: string | undefined,
  { enabled = true }: QueryOptions = {},
) => useQuery<CoursewareMeta>({
  queryKey: coursewareQueryKeys.metadata(courseId!),
  queryFn: () => getCourseMetadata(courseId),
  enabled: enabled && !!courseId,
});

export const minimalCourseOutlineQuery = (courseId: string) => queryOptions({
  queryKey: coursewareQueryKeys.outline(courseId),
  queryFn: (): Promise<MinimalCourseOutline> => getLearningSequencesOutline(courseId),
  meta: { logStatusAs: { 403: 'info' } },
});

export const useMinimalCourseOutline = (
  courseId: string | undefined,
  { enabled = true }: QueryOptions = {},
) => useQuery({
  ...minimalCourseOutlineQuery(courseId!),
  enabled: enabled && !!courseId,
});

export const useCourseSections = (courseId: string | undefined) => useQuery({
  ...minimalCourseOutlineQuery(courseId!),
  enabled: false,
  select: ({ courses, sections }) => {
    const { sectionIds } = courses[courseId!];
    return sectionIds.map((sectionId) => sections[sectionId]);
  },
});

export const useIsCourseLoaded = (courseId: string | undefined): boolean => {
  const metadataQuery = useCoursewareMetadata(courseId, { enabled: false });
  const outlineQuery = useMinimalCourseOutline(courseId, { enabled: false });
  const courseHomeMetaQuery = useCourseHomeMeta(courseId, { enabled: false });
  return metadataQuery.isSuccess && courseHomeMetaQuery.isSuccess
    && !!courseHomeMetaQuery.data?.courseAccess?.hasAccess && outlineQuery.isSuccess;
};

export const useSequenceIds = (courseId: string | undefined): string[] => {
  const isCourseLoaded = useIsCourseLoaded(courseId);
  const courseSections = useCourseSections(courseId).data;
  const sections = isCourseLoaded ? courseSections : undefined;
  return useMemo(
    () => sections?.flatMap((section) => section.sequenceIds) ?? [],
    [sections],
  );
};

export const useIsPreview = () => useLocation().pathname.startsWith('/preview');

export const sequenceMetadataQuery = (sequenceId: string, isPreview: boolean) => queryOptions({
  queryKey: coursewareQueryKeys.sequence(sequenceId, isPreview),
  queryFn: async (): Promise<SequenceMetadataData> => {
    const { sequence, units } = await getSequenceMetadata(sequenceId, { preview: isPreview ? '1' : '0' });
    if (sequence.blockType !== 'sequential') {
      throw new Error(
        `Requested sequence '${sequenceId}' has block type '${sequence.blockType}'; expected block type 'sequential'.`,
      );
    }
    return { sequence, units };
  },
  retry: false,
  meta: { logStatusAs: { 422: 'silent' } },
});

export const useSequenceMetadata = (
  sequenceId: string | undefined,
  { enabled = true }: QueryOptions = {},
) => {
  const isPreview = useIsPreview();
  return useQuery({
    ...sequenceMetadataQuery(sequenceId!, isPreview),
    enabled: enabled && !!sequenceId,
  });
};

// Reads the unit from the sequence CoursewareContainer loaded; never fetches.
export const useUnit = (sequenceId: string | undefined, unitId: string | undefined) => {
  const isPreview = useIsPreview();
  return useQuery({
    ...sequenceMetadataQuery(sequenceId!, isPreview),
    enabled: false,
    select: ({ units }) => units.find(unit => unit.id === unitId),
  });
};

export const updateSequenceUnit = (
  queryClient: QueryClient,
  queryKey: ReturnType<typeof coursewareQueryKeys.sequence>,
  unitId: string | undefined,
  patch: Partial<SequenceUnit>,
) => queryClient.setQueryData<SequenceMetadataData>(queryKey, (data) => data && ({
  ...data,
  units: data.units.map(unit => (unit.id === unitId ? { ...unit, ...patch } : unit)),
}));

// A 422 from the sequence query means the requested id is not a sequence — it may be a unit id.
export const sequenceMightBeUnit = (sequenceQuery: { error: unknown }): boolean => (
  getResponseStatus(sequenceQuery.error) === 422
);

export const useCourseOutlineStructure = (courseId: string | undefined) => useQuery<CourseNavigationOutline | null>({
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

// Names only the fields this repo's TypeScript readers need; the endpoint returns many more,
// left reachable as `unknown` so plugins importing this type are not limited to our list.
// The full shape is openedx-platform's to describe — a copy of it here would drift — so this
// stays partial until the platform ships types we can import.
export interface DiscussionTopic {
  id: string;
  usageKey: string | null;
  enabledInContext: boolean;
  [key: string]: unknown;
}

// Observed by DiscussionsProvider, which owns the fetch.
export const discussionTopicsQuery = (courseId: string) => queryOptions({
  queryKey: coursewareQueryKeys.discussionTopics(courseId),
  queryFn: async () => {
    const config: { provider: string } = await getCourseDiscussionConfig(courseId);
    // Only load topics for the openedx provider, the legacy provider uses
    // the xblock
    if (config.provider !== 'openedx') {
      return [];
    }
    const topics: DiscussionTopic[] = await getCourseTopics(courseId);
    return topics.filter(topic => topic.usageKey);
  },
});

// Reads the topic DiscussionsProvider loaded for the unit; never fetches.
export const useDiscussionTopic = (courseId: string, unitId: string) => useQuery({
  ...discussionTopicsQuery(courseId),
  enabled: false,
  select: (topics) => topics.find(topic => topic.usageKey === unitId),
});

interface CheckBlockCompletionVars {
  courseId: string | undefined;
  sequenceId: string | undefined;
  unitId?: string;
}

export const useCheckBlockCompletion = () => {
  const isPreview = useIsPreview();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: ({ courseId, sequenceId, unitId }: CheckBlockCompletionVars) => (
      getBlockCompletion(courseId, sequenceId, unitId)
    ),
    onSuccess: (isComplete: boolean, { courseId, sequenceId, unitId }) => {
      updateSequenceUnit(
        queryClient,
        coursewareQueryKeys.sequence(sequenceId!, isPreview),
        unitId,
        { complete: isComplete },
      );
      if (!isComplete || !unitId || !courseId) {
        return;
      }
      const queryKey = coursewareQueryKeys.courseOutline(courseId);
      const cachedOutline = queryClient.getQueryData<CourseNavigationOutline | null>(queryKey);
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
    const sequenceKey = coursewareQueryKeys.sequence(sequenceId!, isPreview);
    const unit = queryClient.getQueryData<SequenceMetadataData>(sequenceKey)?.units.find(({ id }) => id === unitId);
    if (unit?.complete) {
      return; // things don't get uncompleted after they are completed
    }
    mutate({ courseId, sequenceId, unitId });
  }, [queryClient, isPreview, mutate]);
};

interface SaveSequencePositionVars {
  courseId: string | undefined;
  sequenceId: string | undefined;
  activeUnitIndex: number;
}

export const useSaveSequencePosition = () => {
  const isPreview = useIsPreview();
  const queryClient = useQueryClient();
  const sequenceKey = (sequenceId: string | undefined) => coursewareQueryKeys.sequence(sequenceId!, isPreview);
  const setPosition = (sequenceId: string | undefined, activeUnitIndex: number) => {
    queryClient.setQueryData<SequenceMetadataData>(sequenceKey(sequenceId), (data) => data && ({
      ...data,
      sequence: { ...data.sequence, activeUnitIndex },
    }));
  };
  const { mutate } = useMutation({
    mutationFn: ({ courseId, sequenceId, activeUnitIndex }: SaveSequencePositionVars) => (
      postSequencePosition(courseId, sequenceId, activeUnitIndex)
    ),
    onMutate: ({ sequenceId, activeUnitIndex }) => {
      const previous = queryClient.getQueryData<SequenceMetadataData>(sequenceKey(sequenceId));
      // Optimistically update the position.
      setPosition(sequenceId, activeUnitIndex);
      return { previous };
    },
    onSuccess: (_data, { sequenceId, activeUnitIndex }) => {
      // Update again under the assumption that the above call succeeded, since it doesn't return a
      // meaningful response.
      setPosition(sequenceId, activeUnitIndex);
    },
    onError: (error, { sequenceId }, context) => {
      logError(error);
      queryClient.setQueryData(sequenceKey(sequenceId), context?.previous);
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
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    // If the request is made by a staff user masquerading as a specific learner,
    // don't actually create a signature for them on the backend,
    // only the modal dialog will be dismissed
    mutationFn: async ({ courseId, isMasquerading }: SaveIntegritySignatureVars) => (
      isMasquerading ? null : postIntegritySignature(courseId)
    ),
    onSuccess: (_data, { courseId }) => {
      queryClient.setQueryData<CoursewareMeta>(
        coursewareQueryKeys.metadata(courseId),
        (data) => data && ({ ...data, userNeedsIntegritySignature: false }),
      );
    },
    onError: (error) => logError(error),
  });

  return useCallback((courseId: string, isMasquerading: boolean) => {
    mutate({ courseId, isMasquerading });
  }, [mutate]);
};
