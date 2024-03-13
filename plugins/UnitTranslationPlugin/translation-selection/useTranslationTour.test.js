import { mockUseKeyedState } from '@edx/react-unit-test-utils';
import { useToggle } from '@edx/paragon';

import useTranslationTour, { stateKeys } from './useTranslationTour';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => () => {
    cb();
    return { useCallback: { cb, prereqs } };
  }),
}));
jest.mock('@edx/paragon', () => ({
  useToggle: jest.fn(),
}));
jest.mock('@edx/frontend-platform/i18n', () => {
  const i18n = jest.requireActual('@edx/frontend-platform/i18n');
  const { formatMessage } = jest.requireActual('@edx/react-unit-test-utils');
  // this provide consistent for the test on different platform/timezone
  const formatDate = jest.fn(date => new Date(date).toISOString()).mockName('useIntl.formatDate');
  return {
    ...i18n,
    useIntl: jest.fn(() => ({
      formatMessage,
      formatDate,
    })),
    defineMessages: m => m,
    FormattedMessage: () => 'FormattedMessage',
  };
});
jest.mock('@src/data/localStorage', () => ({
  getLocalStorage: jest.fn(),
  setLocalStorage: jest.fn(),
}));

const state = mockUseKeyedState(stateKeys);

describe('useTranslationSelection', () => {
  const mockLocalStroage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };

  const toggleOpen = jest.fn();
  const toggleClose = jest.fn();

  useToggle.mockReturnValue([false, toggleOpen, toggleClose]);

  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
    window.localStorage = mockLocalStroage;
  });
  afterEach(() => {
    state.resetVals();
    delete window.localStorage;
  });

  it('do not have translation tour if user already seen it', () => {
    mockLocalStroage.getItem.mockReturnValueOnce('not seen');
    const { translationTour } = useTranslationTour();

    expect(translationTour.enabled).toBe(true);
  });

  it('show translation tour if user has not seen it', () => {
    mockLocalStroage.getItem.mockReturnValueOnce('true');
    const { translationTour } = useTranslationTour();

    expect(translationTour).toMatchObject({});
  });
  test('open and close as pass from useToggle', () => {
    const { isOpen, open, close } = useTranslationTour();
    expect(isOpen).toBe(false);
    expect(toggleOpen).toBe(open);
    expect(toggleClose).toBe(close);
  });
  test('end tour on dismiss button click', () => {
    mockLocalStroage.getItem.mockReturnValueOnce('not seen');
    const { translationTour } = useTranslationTour();
    translationTour.onDismiss();
    expect(mockLocalStroage.setItem).toHaveBeenCalledWith(
      'hasSeenTranslationTour',
      'true',
    );
    state.expectSetStateCalledWith(stateKeys.showTranslationTour, false);
  });
  test('end tour and open modal on try it button click', () => {
    mockLocalStroage.getItem.mockReturnValueOnce('not seen');
    const { translationTour } = useTranslationTour();
    translationTour.onEnd();
    state.expectSetStateCalledWith(stateKeys.showTranslationTour, false);
    expect(toggleOpen).toHaveBeenCalled();
  });
});
