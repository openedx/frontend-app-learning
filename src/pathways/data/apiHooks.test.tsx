import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';

import {
  getCourseOutline,
  getPathway,
  getPathwayAchievements,
  getPathwayItems,
  getPathwayProgress,
  getPathwaysByCourse,
  markPathwayAchievementsSeen,
} from './api';
import {
  pathwayQueryKeys,
  useCourseOutline,
  useCoursePathways,
  useMarkPathwayAchievementsSeen,
  usePathway,
  usePathwayAchievements,
  usePathwayItems,
  usePathwayProgress,
} from './apiHooks';
import {
  courseIdWithPathways,
  courseIdWithoutPathways,
  dataEngineering,
  dataEngineeringAchievements,
  dataEngineeringProgress,
  machineLearning,
  pathwaysByCourse,
} from './__fixtures__/pathways';
import { dataEngineeringItems } from './__fixtures__/pathwayItems';
import { dataPipelinesOutline } from './__fixtures__/courseOutline';

jest.mock('./api', () => ({
  getCourseOutline: jest.fn(),
  getPathway: jest.fn(),
  getPathwayAchievements: jest.fn(),
  getPathwayItems: jest.fn(),
  getPathwayProgress: jest.fn(),
  getPathwaysByCourse: jest.fn(),
  markPathwayAchievementsSeen: jest.fn(),
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const mockGetCourseOutline = getCourseOutline as jest.MockedFunction<typeof getCourseOutline>;
const mockGetPathway = getPathway as jest.MockedFunction<typeof getPathway>;
const mockGetPathwayAchievements = getPathwayAchievements as jest.MockedFunction<typeof getPathwayAchievements>;
const mockGetPathwayItems = getPathwayItems as jest.MockedFunction<typeof getPathwayItems>;
const mockGetPathwayProgress = getPathwayProgress as jest.MockedFunction<typeof getPathwayProgress>;
const mockGetPathwaysByCourse = getPathwaysByCourse as jest.MockedFunction<typeof getPathwaysByCourse>;
const mockMarkPathwayAchievementsSeen = (
  markPathwayAchievementsSeen as jest.MockedFunction<typeof markPathwayAchievementsSeen>
);

const buildWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe('course-pathways apiHooks', () => {
  beforeEach(() => {
    mockGetCourseOutline.mockReset();
    mockGetPathway.mockReset();
    mockGetPathwayAchievements.mockReset();
    mockGetPathwayItems.mockReset();
    mockGetPathwayProgress.mockReset();
    mockGetPathwaysByCourse.mockReset();
    mockMarkPathwayAchievementsSeen.mockReset();
    (logError as jest.Mock).mockReset();
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
  });

  describe('usePathwayProgress', () => {
    const pathwayId = dataEngineeringProgress.id;

    it('returns the progress in the requested pathway', async () => {
      mockGetPathwayProgress.mockResolvedValue(dataEngineeringProgress);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => usePathwayProgress(pathwayId), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetPathwayProgress).toHaveBeenCalledWith(pathwayId);
      expect(result.current.data).toEqual(dataEngineeringProgress);
    });

    it('does not request anything without a pathway', () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => usePathwayProgress(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(mockGetPathwayProgress).not.toHaveBeenCalled();
    });
  });

  describe('usePathwayAchievements', () => {
    const pathwayId = dataEngineering.pathway.id;

    it('returns the achievements earned in the requested pathway', async () => {
      mockGetPathwayAchievements.mockResolvedValue(dataEngineeringAchievements);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => usePathwayAchievements(pathwayId), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetPathwayAchievements).toHaveBeenCalledWith(pathwayId);
      expect(result.current.data).toEqual(dataEngineeringAchievements);
    });

    it('does not request anything without a pathway', () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => usePathwayAchievements(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(mockGetPathwayAchievements).not.toHaveBeenCalled();
    });
  });

  describe('useMarkPathwayAchievementsSeen', () => {
    const pathwayId = dataEngineering.pathway.id;
    const pathwayWithNewAchievements = {
      ...dataEngineering,
      progress: { completedItemCount: 3, hasNewAchievements: true },
    };

    it('marks the achievements as seen and stops reporting them right away', async () => {
      // Never resolves, to check the pathway is updated without waiting for the request
      mockMarkPathwayAchievementsSeen.mockReturnValue(new Promise(() => {}));
      const { queryClient, wrapper } = buildWrapper();
      queryClient.setQueryData(pathwayQueryKeys.pathway(pathwayId), pathwayWithNewAchievements);
      const { result } = renderHook(() => useMarkPathwayAchievementsSeen(), { wrapper });

      act(() => result.current.mutate(pathwayId));

      await waitFor(() => expect(mockMarkPathwayAchievementsSeen).toHaveBeenCalledWith(pathwayId));
      expect(queryClient.getQueryData(pathwayQueryKeys.pathway(pathwayId))).toEqual({
        ...pathwayWithNewAchievements,
        progress: { completedItemCount: 3, hasNewAchievements: false },
      });
    });

    it('logs the error and reloads the pathway when the request fails', async () => {
      const error = new Error('network error');
      mockMarkPathwayAchievementsSeen.mockRejectedValue(error);
      mockGetPathway.mockResolvedValue(pathwayWithNewAchievements);
      const { queryClient, wrapper } = buildWrapper();
      queryClient.setQueryData(pathwayQueryKeys.pathway(pathwayId), pathwayWithNewAchievements);
      // The pathway query must be in use to be reloaded
      renderHook(() => usePathway(pathwayId), { wrapper });
      const { result } = renderHook(() => useMarkPathwayAchievementsSeen(), { wrapper });

      act(() => result.current.mutate(pathwayId));

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(logError).toHaveBeenCalledWith(error);
      await waitFor(() => expect(mockGetPathway).toHaveBeenCalledWith(pathwayId));
    });
  });

  describe('usePathwayItems', () => {
    const pathwayId = dataEngineering.pathway.id;

    it('returns the items of the requested pathway', async () => {
      mockGetPathwayItems.mockResolvedValue(dataEngineeringItems);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => usePathwayItems(pathwayId), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetPathwayItems).toHaveBeenCalledWith(pathwayId);
      expect(result.current.data).toEqual(dataEngineeringItems);
    });

    it('does not request anything without a pathway', () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => usePathwayItems(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(mockGetPathwayItems).not.toHaveBeenCalled();
    });
  });

  describe('useCourseOutline', () => {
    const courseId = 'course-v1:edX+DE102+2026';

    it('returns the sections of the requested course', async () => {
      mockGetCourseOutline.mockResolvedValue(dataPipelinesOutline);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useCourseOutline(courseId), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetCourseOutline).toHaveBeenCalledWith(courseId);
      expect(result.current.data).toEqual(dataPipelinesOutline);
    });

    it('does not request anything without a course', () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useCourseOutline(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(mockGetCourseOutline).not.toHaveBeenCalled();
    });
  });
});
