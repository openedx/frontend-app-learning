import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';

import { getTourData, patchTourData } from './api';
import { useEndCourseHomeTour, useEndCoursewareTour, useTourData } from './apiHooks';
import { tourQueryKeys } from './queryKeys';

jest.mock('./api');
jest.mock('@edx/frontend-platform/logging');

const buildWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe('product-tours apiHooks', () => {
  afterEach(() => jest.clearAllMocks());

  describe('useTourData', () => {
    it('fetches via getTourData when enabled', async () => {
      const data = { toursEnabled: true, courseHomeTourStatus: 'no-tour', showCoursewareTour: false };
      (getTourData as jest.Mock).mockResolvedValue(data);
      const { wrapper } = buildWrapper();

      const { result } = renderHook(() => useTourData('MockUser', true), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getTourData).toHaveBeenCalledWith('MockUser');
      expect(result.current.data).toEqual(data);
    });

    it('does not fetch when disabled', () => {
      const { wrapper } = buildWrapper();
      renderHook(() => useTourData('MockUser', false), { wrapper });
      expect(getTourData).not.toHaveBeenCalled();
    });
  });

  describe('end-tour mutations', () => {
    it('useEndCourseHomeTour PATCHes no-tour and invalidates the user query', async () => {
      (patchTourData as jest.Mock).mockResolvedValue({});
      const { queryClient, wrapper } = buildWrapper();
      const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useEndCourseHomeTour(), { wrapper });
      await act(async () => { await result.current.mutateAsync('MockUser'); });

      expect(patchTourData).toHaveBeenCalledWith('MockUser', { course_home_tour_status: 'no-tour' });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: tourQueryKeys.user('MockUser') });
    });

    it('useEndCoursewareTour PATCHes show_courseware_tour false and invalidates', async () => {
      (patchTourData as jest.Mock).mockResolvedValue({});
      const { queryClient, wrapper } = buildWrapper();
      const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useEndCoursewareTour(), { wrapper });
      await act(async () => { await result.current.mutateAsync('MockUser'); });

      expect(patchTourData).toHaveBeenCalledWith('MockUser', { show_courseware_tour: false });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: tourQueryKeys.user('MockUser') });
    });

    it.each([
      ['useEndCourseHomeTour', useEndCourseHomeTour],
      ['useEndCoursewareTour', useEndCoursewareTour],
    ])('%s logs the error when the PATCH fails', async (_name, useHook) => {
      const error = new Error('nope');
      (patchTourData as jest.Mock).mockRejectedValue(error);
      const { wrapper } = buildWrapper();

      const { result } = renderHook(() => useHook(), { wrapper });
      await act(async () => {
        await result.current.mutateAsync('MockUser').catch(() => {});
      });

      await waitFor(() => expect(logError).toHaveBeenCalledWith(error));
    });
  });
});
