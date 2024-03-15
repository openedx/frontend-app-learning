import { renderHook, act } from '@testing-library/react-hooks';

import useFeedbackWidget from './useFeedbackWidget';

import { useModel } from '../../../../../generic/model-store';
import { createWholeCourseTranslationFeedback, fetchWholeCourseTranslationFeedback } from './data/thunks';

jest.mock('./data/thunks', () => ({
  createWholeCourseTranslationFeedback: jest.fn(),
  fetchWholeCourseTranslationFeedback: jest.fn(),
}));

jest.mock('../../../../../generic/model-store', () => ({
  useModel: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const initialProps = {
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  translationLanguage: 'es',
  unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc',
  userId: 3,
};

const newProps = {
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  translationLanguage: 'fr',
  unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc',
  userId: 3,
};

describe('useFeedbackWidget', () => {
  beforeEach(async () => {
    useModel.mockReturnValue({
      translationFeedback: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('closeFeedbackWidget behavior', () => {
    const { result, waitFor } = renderHook(() => useFeedbackWidget(initialProps));
    waitFor(() => expect(result.current.showFeedbackWidget.toBe(true)));
    expect(result.current.showFeedbackWidget).toBe(true);
    act(() => {
      result.current.closeFeedbackWidget();
    });
    expect(result.current.showFeedbackWidget).toBe(false);
  });

  test('openFeedbackWidget behavior', () => {
    const { result } = renderHook(() => useFeedbackWidget(initialProps));
    act(() => {
      result.current.closeFeedbackWidget();
    });
    expect(result.current.showFeedbackWidget).toBe(false);
    act(() => {
      result.current.openFeedbackWidget();
    });
    expect(result.current.showFeedbackWidget).toBe(true);
  });

  test('openGratitudeText behavior', async () => {
    const { result, waitFor } = renderHook(() => useFeedbackWidget(initialProps));

    expect(result.current.showGratitudeText).toBe(false);
    act(() => {
      result.current.openGratitudeText();
    });
    expect(result.current.showGratitudeText).toBe(true);
    // Wait for 3 seconds to hide the gratitude text
    waitFor(() => {
      expect(result.current.showGratitudeText).toBe(false);
    }, { timeout: 3000 });
  });

  test('sendFeedback behavior', () => {
    const { result, waitFor } = renderHook(() => useFeedbackWidget(initialProps));
    const feedbackValue = true;

    waitFor(() => expect(result.current.showFeedbackWidget.toBe(true)));

    expect(result.current.showGratitudeText).toBe(false);
    act(() => {
      result.current.sendFeedback(feedbackValue);
    });

    waitFor(() => {
      expect(result.current.showFeedbackWidget).toBe(false);
      expect(result.current.showGratitudeText).toBe(true);
    });

    expect(mockDispatch).toHaveBeenCalled();
    expect(createWholeCourseTranslationFeedback).toHaveBeenCalledWith(
      initialProps.courseId,
      feedbackValue,
      initialProps.translationLanguage,
      initialProps.unitId,
      initialProps.userId,
    );

    // Wait for 3 seconds to hide the gratitude text
    waitFor(() => {
      expect(result.current.showGratitudeText).toBe(false);
    }, { timeout: 3000 });
  });

  test('fetch feedback on initialization', () => {
    const { waitFor } = renderHook(() => useFeedbackWidget(initialProps));
    waitFor(() => {
      expect(fetchWholeCourseTranslationFeedback).toHaveBeenCalledWith(
        initialProps.courseId,
        initialProps.translationLanguage,
        initialProps.unitId,
        initialProps.userId,
      );
    });
  });

  test('fetch feedback on props update', () => {
    const { rerender, waitFor } = renderHook(() => useFeedbackWidget(initialProps));
    waitFor(() => {
      expect(fetchWholeCourseTranslationFeedback).toHaveBeenCalledWith(
        initialProps.courseId,
        initialProps.translationLanguage,
        initialProps.unitId,
        initialProps.userId,
      );
    });
    rerender(newProps);
    waitFor(() => {
      expect(fetchWholeCourseTranslationFeedback).toHaveBeenCalledWith(
        newProps.courseId,
        newProps.translationLanguage,
        newProps.unitId,
        newProps.userId,
      );
    });
  });
});
