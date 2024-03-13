import { mockUseKeyedState } from '@edx/react-unit-test-utils';
import {
  getLocalStorage,
  setLocalStorage,
} from '@src/data/localStorage';

import useSelectLanguage, {
  stateKeys,
  languages,
  selectedLanguageKey,
  getIndexByLanguage,
  getLanguageByIndex,
} from './useSelectLanguage';

import { languageMessages } from './messages';

const state = mockUseKeyedState(stateKeys);

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => (...args) => [
    cb(...args),
    { cb, prereqs },
  ]),
}));
jest.mock('@src/data/localStorage', () => ({
  getLocalStorage: jest.fn(),
  setLocalStorage: jest.fn(),
}));

describe('useSelectLanguage', () => {
  const props = {
    courseId: 'test-course-id',
    language: 'en',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
  });
  afterEach(() => {
    state.resetVals();
  });

  languages.forEach(([key, value]) => {
    it(`initializes selectedLanguage to the selected language (${value})`, () => {
      getLocalStorage.mockReturnValueOnce({ [props.courseId]: key });
      const { selectedLanguage } = useSelectLanguage(props);

      state.expectInitializedWith(stateKeys.selectedLanguage, key);
      expect(selectedLanguage).toBe(key);
    });
  });

  test('setSelectedLanguage behavior', () => {
    const { setSelectedLanguage } = useSelectLanguage(props);

    setSelectedLanguage('es');
    state.expectSetStateCalledWith(stateKeys.selectedLanguage, 'es');
    expect(setLocalStorage).toHaveBeenCalledWith(selectedLanguageKey, {
      [props.courseId]: 'es',
    });
  });
});

describe('getIndexByLanguage', () => {
  it('returns the index of the language', () => {
    languages.forEach(([key], index) => {
      expect(getIndexByLanguage(key)).toBe(index);
    });
  });
});

describe('getLanguageByIndex', () => {
  it('returns the language for the index', () => {
    languages.forEach(([key], index) => {
      expect(getLanguageByIndex(index)).toBe(key);
    });
  });
});

describe('language messages', () => {
  it('has a message defined for each language', () => {
    languages.forEach(([, value]) => {
      expect(languageMessages[value].defaultMessage).toBeDefined();
    });
  });
});
