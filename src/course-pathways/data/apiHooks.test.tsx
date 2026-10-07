import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getConfig, setConfig } from '@edx/frontend-platform';

import { getPathwaysByCourse } from './api';
import { useCoursePathways } from './apiHooks';
import {
  courseIdWithPathways,
  courseIdWithoutPathways,
  dataEngineering,
  machineLearning,
  pathwaysByCourse,
} from './__fixtures__/pathways';

jest.mock('./api', () => ({
  getPathwaysByCourse: jest.fn(),
}));

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
  const originalConfig = getConfig();

  beforeEach(() => {
    mockGetPathwaysByCourse.mockReset();
    setConfig({ ...originalConfig, ENABLE_PATHWAY_PILOT_UI: true });
  });

  afterEach(() => {
    setConfig(originalConfig);
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

    it('does not request anything when the pathway pilot UI is disabled', () => {
      setConfig({ ...originalConfig, ENABLE_PATHWAY_PILOT_UI: false });
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useCoursePathways(courseIdWithPathways), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
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
});
