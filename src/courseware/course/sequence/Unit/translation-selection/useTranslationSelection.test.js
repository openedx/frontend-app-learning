import { mockUseKeyedState } from '@edx/react-unit-test-utils';
import {
  getLocalStorage,
  setLocalStorage,
} from '../../../../../data/localStorage';

import useTranslationSelection, { stateKeys, languages } from './useTranslationSelection';

import { languageMessages } from './messages';

const state = mockUseKeyedState(stateKeys);

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => ({ useCallback: { cb, prereqs } })),
}));
jest.mock('../../../../../data/localStorage', () => ({
  getLocalStorage: jest.fn(),
  setLocalStorage: jest.fn(),
}));

describe('useTranslationSelection', () => {
  const props = { courseId: 'some-course-id', close: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
  });
  afterEach(() => {
    state.resetVals();
  });

  languages.forEach(([key, value], index) => {
    it(`initializes selectedIndex to the index of the selected language (${value})`, () => {
      getLocalStorage.mockReturnValueOnce({ [props.courseId]: key });
      const { selectedIndex } = useTranslationSelection(props);

      state.expectInitializedWith(stateKeys.selectedIndex, index);
      expect(selectedIndex).toBe(index);
    });
  });

  test('onSubmit behavior', () => {
    const { onSubmit } = useTranslationSelection(props);

    onSubmit.useCallback.cb();
    expect(setLocalStorage).toHaveBeenCalled();
    expect(props.close).toHaveBeenCalled();
  });
});

describe('language messages', () => {
  it('has a message defined for each language', () => {
    languages.forEach(([, value]) => {
      expect(languageMessages[value].defaultMessage).toBeDefined();
    });
  });
});
