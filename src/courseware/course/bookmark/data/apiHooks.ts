import { useCallback } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateSequenceUnit, useIsPreview } from '@src/courseware/data/apiHooks';
import { coursewareQueryKeys } from '@src/courseware/data/queryKeys';
import { createBookmark, deleteBookmark } from './api';

interface SetBookmarkedVars {
  sequenceId: string;
  unitId: string;
  bookmarked: boolean;
}

export const useSetBookmarked = () => {
  const isPreview = useIsPreview();
  const queryClient = useQueryClient();
  const setBookmarkState = (
    sequenceId: string,
    unitId: string,
    bookmarked: boolean,
    bookmarkedUpdateState: 'loading' | 'loaded' | 'failed',
  ) => {
    updateSequenceUnit(
      queryClient,
      coursewareQueryKeys.sequence(sequenceId, isPreview),
      unitId,
      { bookmarked, bookmarkedUpdateState },
    );
  };
  const { mutate } = useMutation({
    mutationFn: ({ unitId, bookmarked }: SetBookmarkedVars) => (
      bookmarked ? createBookmark(unitId) : deleteBookmark(unitId)
    ),
    // Optimistically update the bookmarked flag.
    onMutate: ({ sequenceId, unitId, bookmarked }) => setBookmarkState(sequenceId, unitId, bookmarked, 'loading'),
    onSuccess: (_data, { sequenceId, unitId, bookmarked }) => setBookmarkState(sequenceId, unitId, bookmarked, 'loaded'),
    onError: (error, { sequenceId, unitId, bookmarked }) => {
      logError(error);
      setBookmarkState(sequenceId, unitId, !bookmarked, 'failed');
    },
  });

  return useCallback((sequenceId: string, unitId: string, bookmarked: boolean) => {
    mutate({ sequenceId, unitId, bookmarked });
  }, [mutate]);
};
