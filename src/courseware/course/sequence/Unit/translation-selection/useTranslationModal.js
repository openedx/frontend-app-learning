import { useCallback } from 'react';
import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils';

import { getIndexByLanguage, getLanguageByIndex } from './useSelectLanguage';

export const stateKeys = StrictDict({
  selectedIndex: 'selectedIndex',
});

const useTranslationModal = ({ selectedLanguage, setSelectedLanguage, close }) => {
  const [selectedIndex, setSelectedIndex] = useKeyedState(
    stateKeys.selectedIndex,
    getIndexByLanguage(selectedLanguage),
  );

  const onSubmit = useCallback(() => {
    const newSelectedLanguage = getLanguageByIndex(selectedIndex);
    setSelectedLanguage(newSelectedLanguage);
    close();
  }, [selectedIndex]);

  return {
    selectedIndex,
    setSelectedIndex,
    onSubmit,
  };
};

export default useTranslationModal;
