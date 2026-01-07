import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useGetExamsData } from './hooks';
import { fetchExamAttemptsData } from '../data/thunks';

// Mock the dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../data/thunks', () => ({
  fetchExamAttemptsData: jest.fn(),
}));

describe('useGetExamsData hook', () => {
  const mockDispatch = jest.fn();
  const mockFetchExamAttemptsData = jest.fn();

  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    fetchExamAttemptsData.mockReturnValue(mockFetchExamAttemptsData);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should dispatch fetchExamAttemptsData on mount', () => {
    const courseId = 'course-v1:edX+DemoX+Demo_Course';
    const sequenceIds = [
      'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
      'block-v1:edX+DemoX+Demo_Course+type@sequential+block@67890',
    ];

    renderHook(() => useGetExamsData(courseId, sequenceIds));

    expect(fetchExamAttemptsData).toHaveBeenCalledWith(courseId, sequenceIds);
    expect(mockDispatch).toHaveBeenCalledWith(mockFetchExamAttemptsData);
  });

  it('should re-dispatch when courseId changes', () => {
    const initialCourseId = 'course-v1:edX+DemoX+Demo_Course';
    const newCourseId = 'course-v1:edX+NewCourse+Demo';
    const sequenceIds = ['block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345'];

    const { rerender } = renderHook(
      ({ courseId: cId, sequenceIds: sIds }) => useGetExamsData(cId, sIds),
      {
        initialProps: { courseId: initialCourseId, sequenceIds },
      },
    );

    // Verify initial call
    expect(fetchExamAttemptsData).toHaveBeenCalledWith(initialCourseId, sequenceIds);
    expect(mockDispatch).toHaveBeenCalledWith(mockFetchExamAttemptsData);

    // Clear mocks to isolate the re-render call
    jest.clearAllMocks();

    // Re-render with new courseId
    rerender({ courseId: newCourseId, sequenceIds });

    expect(fetchExamAttemptsData).toHaveBeenCalledWith(newCourseId, sequenceIds);
    expect(mockDispatch).toHaveBeenCalledWith(mockFetchExamAttemptsData);
  });

  it('should re-dispatch when sequenceIds changes', () => {
    const courseId = 'course-v1:edX+DemoX+Demo_Course';
    const initialSequenceIds = ['block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345'];
    const newSequenceIds = [
      'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
      'block-v1:edX+DemoX+Demo_Course+type@sequential+block@67890',
    ];

    const { rerender } = renderHook(
      ({ courseId: cId, sequenceIds: sIds }) => useGetExamsData(cId, sIds),
      {
        initialProps: { courseId, sequenceIds: initialSequenceIds },
      },
    );

    // Verify initial call
    expect(fetchExamAttemptsData).toHaveBeenCalledWith(courseId, initialSequenceIds);
    expect(mockDispatch).toHaveBeenCalledWith(mockFetchExamAttemptsData);

    // Clear mocks to isolate the re-render call
    jest.clearAllMocks();

    // Re-render with new sequenceIds
    rerender({ courseId, sequenceIds: newSequenceIds });

    expect(fetchExamAttemptsData).toHaveBeenCalledWith(courseId, newSequenceIds);
    expect(mockDispatch).toHaveBeenCalledWith(mockFetchExamAttemptsData);
  });

  it('should not re-dispatch when neither courseId nor sequenceIds changes', () => {
    const courseId = 'course-v1:edX+DemoX+Demo_Course';
    const sequenceIds = ['block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345'];

    const { rerender } = renderHook(
      ({ courseId: cId, sequenceIds: sIds }) => useGetExamsData(cId, sIds),
      {
        initialProps: { courseId, sequenceIds },
      },
    );

    // Verify initial call
    expect(fetchExamAttemptsData).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);

    // Clear mocks to isolate the re-render call
    jest.clearAllMocks();

    // Re-render with same props
    rerender({ courseId, sequenceIds });

    // Should not dispatch again
    expect(fetchExamAttemptsData).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should handle empty sequenceIds array', () => {
    const courseId = 'course-v1:edX+DemoX+Demo_Course';
    const sequenceIds = [];

    renderHook(() => useGetExamsData(courseId, sequenceIds));

    expect(fetchExamAttemptsData).toHaveBeenCalledWith(courseId, []);
    expect(mockDispatch).toHaveBeenCalledWith(mockFetchExamAttemptsData);
  });

  it('should handle null/undefined courseId', () => {
    const sequenceIds = ['block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345'];

    renderHook(() => useGetExamsData(null, sequenceIds));

    expect(fetchExamAttemptsData).toHaveBeenCalledWith(null, sequenceIds);
    expect(mockDispatch).toHaveBeenCalledWith(mockFetchExamAttemptsData);
  });

  it('should handle sequenceIds reference change but same content', () => {
    const courseId = 'course-v1:edX+DemoX+Demo_Course';
    const sequenceIds1 = ['block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345'];
    const sequenceIds2 = ['block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345']; // Same content, different reference

    const { rerender } = renderHook(
      ({ courseId: cId, sequenceIds: sIds }) => useGetExamsData(cId, sIds),
      {
        initialProps: { courseId, sequenceIds: sequenceIds1 },
      },
    );

    // Verify initial call
    expect(fetchExamAttemptsData).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);

    // Clear mocks to isolate the re-render call
    jest.clearAllMocks();

    // Re-render with different reference but same content
    rerender({ courseId, sequenceIds: sequenceIds2 });

    // Should dispatch again because the reference changed (useEffect dependency)
    expect(fetchExamAttemptsData).toHaveBeenCalledWith(courseId, sequenceIds2);
    expect(mockDispatch).toHaveBeenCalledWith(mockFetchExamAttemptsData);
  });
});
