import { logError } from '@edx/frontend-platform/logging';
import {
  queryOptions, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';

import { appId } from '@src/constants';
import { getTourData, patchTourData } from './api';

const toursKey = [appId, 'tours'] as const;

export const tourDataQuery = (username: string) => queryOptions({
  queryKey: [...toursKey, username] as const,
  queryFn: () => getTourData(username),
});

export const useTourData = (username: string, enabled: boolean) => useQuery({
  ...tourDataQuery(username),
  enabled,
});

export const useEndCourseHomeTour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => patchTourData(username, { course_home_tour_status: 'no-tour' }),
    onSuccess: (_data, username) => queryClient.invalidateQueries({ queryKey: tourDataQuery(username).queryKey }),
    onError: (error) => logError(error),
  });
};

export const useEndCoursewareTour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => patchTourData(username, { show_courseware_tour: false }),
    onSuccess: (_data, username) => queryClient.invalidateQueries({ queryKey: tourDataQuery(username).queryKey }),
    onError: (error) => logError(error),
  });
};
