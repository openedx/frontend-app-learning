import { renderHook, act } from '@testing-library/react-hooks';

import useFeedbackWidget from './useFeedbackWidget';
import { createTranslationFeedback, getTranslationFeedback } from '../data/api';

jest.mock('../data/api', () => ({
  createTranslationFeedback: jest.fn(),
  getTranslationFeedback: jest.fn(),
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
    getTranslationFeedback.mockReturnValue('');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('closeFeedbackWidget behavior', () => {
    const { result, waitFor } = renderHook(() => useFeedbackWidget(initialProps));
    waitFor(() => expect(result.current.showFeedbackWidget.toBe(true)));
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

    expect(createTranslationFeedback).toHaveBeenCalledWith({
      courseId: initialProps.courseId,
      feedbackValue,
      translationLanguage: initialProps.translationLanguage,
      unitId: initialProps.unitId,
      userId: initialProps.userId,
    });

    // Wait for 3 seconds to hide the gratitude text
    waitFor(() => {
      expect(result.current.showGratitudeText).toBe(false);
    }, { timeout: 3000 });
  });

  test('onThumbsUpClick behavior', () => {
    const { result } = renderHook(() => useFeedbackWidget(initialProps));

    act(() => {
      result.current.onThumbsUpClick();
    });

    expect(createTranslationFeedback).toHaveBeenCalledWith({
      courseId: initialProps.courseId,
      feedbackValue: true,
      translationLanguage: initialProps.translationLanguage,
      unitId: initialProps.unitId,
      userId: initialProps.userId,
    });
  });

  test('onThumbsDownClick behavior', () => {
    const { result } = renderHook(() => useFeedbackWidget(initialProps));

    act(() => {
      result.current.onThumbsDownClick();
    });

    expect(createTranslationFeedback).toHaveBeenCalledWith({
      courseId: initialProps.courseId,
      feedbackValue: false,
      translationLanguage: initialProps.translationLanguage,
      unitId: initialProps.unitId,
      userId: initialProps.userId,
    });
  });

  test('fetch feedback on initialization', () => {
    const { waitFor } = renderHook(() => useFeedbackWidget(initialProps));
    waitFor(() => {
      expect(getTranslationFeedback).toHaveBeenCalledWith({
        courseId: initialProps.courseId,
        translationLanguage: initialProps.translationLanguage,
        unitId: initialProps.unitId,
        userId: initialProps.userId,
      });
    });
  });

  test('fetch feedback on props update', () => {
    const { rerender, waitFor } = renderHook(() => useFeedbackWidget(initialProps));
    waitFor(() => {
      expect(getTranslationFeedback).toHaveBeenCalledWith({
        courseId: initialProps.courseId,
        translationLanguage: initialProps.translationLanguage,
        unitId: initialProps.unitId,
        userId: initialProps.userId,
      });
    });
    rerender(newProps);
    waitFor(() => {
      expect(getTranslationFeedback).toHaveBeenCalledWith({
        courseId: newProps.courseId,
        translationLanguage: newProps.translationLanguage,
        unitId: newProps.unitId,
        userId: newProps.userId,
      });
    });
  });
});
