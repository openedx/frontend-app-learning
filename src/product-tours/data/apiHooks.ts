import { logError } from '@edx/frontend-platform/logging';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getTourData, patchTourData } from './api';
import { tourQueryKeys } from './queryKeys';

export const useTourData = (username: string, enabled: boolean) => useQuery({
  queryKey: tourQueryKeys.user(username),
  queryFn: () => getTourData(username),
  enabled,
  refetchOnWindowFocus: false,
});

export const useEndCourseHomeTour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => patchTourData(username, { course_home_tour_status: 'no-tour' }),
    onSuccess: (_data, username) => queryClient.invalidateQueries({ queryKey: tourQueryKeys.user(username) }),
    onError: (error) => logError(error),
  });
};

export const useEndCoursewareTour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => patchTourData(username, { show_courseware_tour: false }),
    onSuccess: (_data, username) => queryClient.invalidateQueries({ queryKey: tourQueryKeys.user(username) }),
    onError: (error) => logError(error),
  });
};
