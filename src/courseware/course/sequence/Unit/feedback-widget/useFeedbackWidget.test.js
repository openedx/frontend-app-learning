import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import useFeedbackWidget from './useFeedbackWidget';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => ({ useCallback: { cb, prereqs } })),
  useState: jest.fn(),
}));

const setState = jest.fn();
React.useState.mockImplementation((val) => [val, setState]);

describe('useFeedbackWidget', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    languageCode: 'es',
    unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@37b72b3915204b70acb00c55b604b563',
    userId: '123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sendFeedback behavior', async () => {
    const { result } = renderHook(() => (
      useFeedbackWidget(props)
    ));
    const closeFeedbackWidgetSpy = jest.spyOn(result.current, 'closeFeedbackWidget');
    const openGratitudeTextSpy = jest.spyOn(result.current, 'openGratitudeText');

    expect(result.current.showFeedbackWidget).toBe(true);
    expect(result.current.showGratitudeText).toBe(false);
    result.current.sendFeedback.useCallback.cb();
    expect(closeFeedbackWidgetSpy).toHaveBeenCalled();
    expect(openGratitudeTextSpy).toHaveBeenCalled();
  });
});
