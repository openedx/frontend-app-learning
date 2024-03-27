import { mockUseKeyedState } from '@edx/react-unit-test-utils';

import useTranslationModal, { stateKeys } from './useTranslationModal';

const state = mockUseKeyedState(stateKeys);

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => (...args) => ([
    cb(...args), { cb, prereqs },
  ])),
}));

describe('useTranslationModal', () => {
  const props = {
    selectedLanguage: 'en',
    setSelectedLanguage: jest.fn(),
    close: jest.fn(),
    availableLanguages: [
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Spanish' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
  });
  afterEach(() => {
    state.resetVals();
  });

  it('initializes selectedIndex to the index of the selected language', () => {
    const { selectedIndex } = useTranslationModal(props);

    state.expectInitializedWith(stateKeys.selectedIndex, 0);
    expect(selectedIndex).toBe(0);
  });

  it('onSubmit updates the selected language and closes the modal', () => {
    const { onSubmit } = useTranslationModal({
      ...props,
      selectedLanguage: 'es',
    });
    onSubmit();
    expect(props.setSelectedLanguage).toHaveBeenCalledWith('es');
    expect(props.close).toHaveBeenCalled();
  });
});
