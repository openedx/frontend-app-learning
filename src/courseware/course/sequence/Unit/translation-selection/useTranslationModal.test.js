import { mockUseKeyedState } from '@edx/react-unit-test-utils';

import { getIndexByLanguage, getLanguageByIndex } from './useSelectLanguage';
import useTranslationModal, { stateKeys } from './useTranslationModal';

const state = mockUseKeyedState(stateKeys);

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => (...args) => ([
    cb(...args), { cb, prereqs },
  ])),
}));
jest.mock('./useSelectLanguage', () => ({
  getIndexByLanguage: jest.fn(),
  getLanguageByIndex: jest.fn(),
}));

describe('useTranslationModal', () => {
  const props = {
    selectedLanguage: 'en',
    setSelectedLanguage: jest.fn(),
    close: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
  });
  afterEach(() => {
    state.resetVals();
  });

  it('initializes selectedIndex to the index of the selected language', () => {
    getIndexByLanguage.mockReturnValueOnce(1);
    const { selectedIndex } = useTranslationModal(props);

    state.expectInitializedWith(stateKeys.selectedIndex, 1);
    expect(selectedIndex).toBe(1);
  });

  it('onSubmit updates the selected language and closes the modal', () => {
    const { onSubmit } = useTranslationModal(props);
    getLanguageByIndex.mockReturnValueOnce('es');
    onSubmit();
    expect(props.setSelectedLanguage).toHaveBeenCalledWith('es');
    expect(props.close).toHaveBeenCalled();
  });
});
