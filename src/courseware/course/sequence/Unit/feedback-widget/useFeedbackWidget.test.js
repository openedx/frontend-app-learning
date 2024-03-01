import { renderHook, act } from '@testing-library/react-hooks';

import useFeedbackWidget from './useFeedbackWidget';

describe('useFeedbackWidget', () => {
  test('closeFeedbackWidget behavior', () => {
    const { result } = renderHook(() => useFeedbackWidget());

    expect(result.current.showFeedbackWidget).toBe(true);
    act(() => {
      result.current.closeFeedbackWidget();
    });
    expect(result.current.showFeedbackWidget).toBe(false);
  });

  test('openFeedbackWidget behavior', () => {
    const { result } = renderHook(() => useFeedbackWidget());

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
    const { result, waitFor } = renderHook(() => useFeedbackWidget());

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
    const { result, waitFor } = renderHook(() => useFeedbackWidget());

    expect(result.current.showFeedbackWidget).toBe(true);
    expect(result.current.showGratitudeText).toBe(false);
    act(() => {
      result.current.sendFeedback();
    });
    expect(result.current.showFeedbackWidget).toBe(false);
    expect(result.current.showGratitudeText).toBe(true);

    // Wait for 3 seconds to hide the gratitude text
    waitFor(() => {
      expect(result.current.showGratitudeText).toBe(false);
    }, { timeout: 3000 });
  });
});
