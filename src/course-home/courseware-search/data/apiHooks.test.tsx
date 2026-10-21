import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { getCoursewareSearchEnabled, searchCourseContentFromAPI } from '../../data/api';
import mapSearchResponse from '../map-search-response';
import { useCoursewareSearchEnabled, useCoursewareSearchResults } from './apiHooks';

jest.mock('../../data/api');
jest.mock('../map-search-response');

const buildWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

describe('courseware-search apiHooks', () => {
  afterEach(() => jest.clearAllMocks());

  describe('useCoursewareSearchEnabled', () => {
    it('fetches the feature flag for the course', async () => {
      (getCoursewareSearchEnabled as jest.Mock).mockResolvedValue({ enabled: true });
      const { wrapper } = buildWrapper();

      const { result } = renderHook(() => useCoursewareSearchEnabled('course-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getCoursewareSearchEnabled).toHaveBeenCalledWith('course-1');
      expect(result.current.data).toEqual({ enabled: true });
    });
  });

  describe('useCoursewareSearchResults', () => {
    it('does not fetch when there is no keyword', () => {
      const { wrapper } = buildWrapper();

      renderHook(() => useCoursewareSearchResults('course-1', ''), { wrapper });

      expect(searchCourseContentFromAPI).not.toHaveBeenCalled();
    });

    it('fetches and maps the results when there is a keyword', async () => {
      const response = { results: [{ id: '1' }] };
      (searchCourseContentFromAPI as jest.Mock).mockResolvedValue({ data: response });
      (mapSearchResponse as jest.Mock).mockReturnValue({ results: [{ id: '1' }], total: 1 });
      const { wrapper } = buildWrapper();

      const { result } = renderHook(() => useCoursewareSearchResults('course-1', 'test'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(searchCourseContentFromAPI).toHaveBeenCalledWith('course-1', 'test');
      expect(mapSearchResponse).toHaveBeenCalledWith(response, 'test');
      expect(result.current.data).toEqual({ results: [{ id: '1' }], total: 1 });
    });
  });
});
