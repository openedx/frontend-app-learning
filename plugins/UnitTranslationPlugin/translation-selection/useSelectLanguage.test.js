import { mockUseKeyedState } from '@edx/react-unit-test-utils';
import {
  getLocalStorage,
  setLocalStorage,
} from '@src/data/localStorage';

import useSelectLanguage, {
  stateKeys,
  selectedLanguageKey,
} from './useSelectLanguage';

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
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
  });
  afterEach(() => {
    state.resetVals();
  });

  languages.forEach(({ code, label }) => {
    it(`initializes selectedLanguage to the selected language (${label})`, () => {
      getLocalStorage.mockReturnValueOnce({ [props.courseId]: code });
      const { selectedLanguage } = useSelectLanguage(props);

      state.expectInitializedWith(stateKeys.selectedLanguage, code);
      expect(selectedLanguage).toBe(code);
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
