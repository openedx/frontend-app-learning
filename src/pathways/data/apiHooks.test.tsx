import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { getPathway, getPathwaysByCourse } from './api';
import { useCoursePathways, usePathway } from './apiHooks';
import {
  courseIdWithPathways,
  courseIdWithoutPathways,
  dataEngineering,
  machineLearning,
  pathwaysByCourse,
} from './__fixtures__/pathways';

jest.mock('./api', () => ({
  getPathway: jest.fn(),
  getPathwaysByCourse: jest.fn(),
}));

const mockGetPathway = getPathway as jest.MockedFunction<typeof getPathway>;
const mockGetPathwaysByCourse = getPathwaysByCourse as jest.MockedFunction<typeof getPathwaysByCourse>;

const buildWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

describe('course-pathways apiHooks', () => {
  beforeEach(() => {
    mockGetPathway.mockReset();
    mockGetPathwaysByCourse.mockReset();
  });

  describe('useCoursePathways', () => {
    it('requests the pathways of the given course', async () => {
      mockGetPathwaysByCourse.mockResolvedValue(pathwaysByCourse);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useCoursePathways(courseIdWithPathways), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetPathwaysByCourse).toHaveBeenCalledWith([courseIdWithPathways]);
    });

    it('returns only the pathways of the given course', async () => {
      mockGetPathwaysByCourse.mockResolvedValue(pathwaysByCourse);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useCoursePathways(courseIdWithPathways), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([dataEngineering, machineLearning]);
    });

    it('returns an empty list when the course has no pathways', async () => {
      mockGetPathwaysByCourse.mockResolvedValue(pathwaysByCourse);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useCoursePathways(courseIdWithoutPathways), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('does not request anything without a course', () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useCoursePathways(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(mockGetPathwaysByCourse).not.toHaveBeenCalled();
    });

    it('exposes the error when the request fails', async () => {
      mockGetPathwaysByCourse.mockRejectedValue(new Error('network error'));
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useCoursePathways(courseIdWithPathways), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('usePathway', () => {
    const pathwayId = dataEngineering.pathway.id;

    it('returns the requested pathway', async () => {
      mockGetPathway.mockResolvedValue(dataEngineering);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => usePathway(pathwayId), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetPathway).toHaveBeenCalledWith(pathwayId);
      expect(result.current.data).toEqual(dataEngineering);
    });

    it('does not request anything without a pathway', () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => usePathway(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(mockGetPathway).not.toHaveBeenCalled();
    });

    it('exposes the error when the request fails', async () => {
      mockGetPathway.mockRejectedValue(new Error('network error'));
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => usePathway(pathwayId), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.data).toBeUndefined();
    });
  });
});
