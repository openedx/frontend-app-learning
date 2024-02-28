import useFeedbackWidget from './useFeedbackWidget';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => ({ useCallback: { cb, prereqs } })),
  useState: jest.fn(),
}));

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

  test('sendFeedback behavior', () => {
    const {
      sendFeedback,
      showFeedbackWidget,
      showGratitudeText,
    } = useFeedbackWidget(props);

    expect(showFeedbackWidget).toBe(true);
    expect(showGratitudeText).toBe(false);
    sendFeedback.useCallback.cb();
    expect(showFeedbackWidget).toBe(false);
    expect(showFeedbackWidget).toBe(true);
  });
});
