import { useCallback } from 'react';
import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils';

export const stateKeys = StrictDict({
  selectedIndex: 'selectedIndex',
});

const useTranslationModal = ({
  selectedLanguage, setSelectedLanguage, close, availableLanguages,
}) => {
  const [selectedIndex, setSelectedIndex] = useKeyedState(
    stateKeys.selectedIndex,
    availableLanguages.findIndex((lang) => lang.code === selectedLanguage),
  );

  const onSubmit = useCallback(() => {
    const newSelectedLanguage = availableLanguages[selectedIndex].code;
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
