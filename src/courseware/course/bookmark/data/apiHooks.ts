import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logError } from '@edx/frontend-platform/logging';
import { useMutation } from '@tanstack/react-query';

import { updateModel } from '@src/generic/model-store';
import { createBookmark, deleteBookmark } from './api';

interface SetBookmarkedVars {
  unitId: string;
  bookmarked: boolean;
}

export const useSetBookmarked = () => {
  const dispatch = useDispatch();
  const setBookmarkState = (unitId: string, bookmarked: boolean, bookmarkedUpdateState: string) => {
    dispatch(updateModel({ modelType: 'units', model: { id: unitId, bookmarked, bookmarkedUpdateState } }));
  };
  const { mutate } = useMutation({
    mutationFn: ({ unitId, bookmarked }: SetBookmarkedVars) => (
      bookmarked ? createBookmark(unitId) : deleteBookmark(unitId)
    ),
    // Optimistically update the bookmarked flag.
    onMutate: ({ unitId, bookmarked }) => setBookmarkState(unitId, bookmarked, 'loading'),
    onSuccess: (_data, { unitId, bookmarked }) => setBookmarkState(unitId, bookmarked, 'loaded'),
    onError: (error, { unitId, bookmarked }) => {
      logError(error);
      setBookmarkState(unitId, !bookmarked, 'failed');
    },
  });

  return useCallback((unitId: string, bookmarked: boolean) => {
    mutate({ unitId, bookmarked });
  }, [mutate]);
};
