import { useCallback } from 'react';
import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils';
import {
  getLocalStorage,
  setLocalStorage,
} from '../../../../../data/localStorage';

export const selectedLanguageKey = 'selectedLanguages';

export const languages = Object.entries({
  en: 'English',
  es: 'Spanish',
});

export const stateKeys = StrictDict({
  selectedIndex: 'selectedIndex',
});

// TODO: this should be rewrite in the future decision. Currently it return
// null if the language is English or not set.
export const getTranslateLanguage = (courseId) => {
  const selectedLanguageItem = getLocalStorage(selectedLanguageKey) || {};
  return selectedLanguageItem[courseId] !== 'en'
    ? selectedLanguageItem[courseId]
    : null;
};

const useTranslationSelection = ({ courseId, close }) => {
  const selectedLanguageItem = getLocalStorage(selectedLanguageKey) || {};
  const selectedLanguage = selectedLanguageItem[courseId] || 'en';
  const [selectedIndex, setSelectedIndex] = useKeyedState(
    stateKeys.selectedIndex,
    languages.findIndex(([key]) => key === selectedLanguage),
  );

  const onSubmit = useCallback(() => {
    const newSelectedLanguage = languages[selectedIndex][0];
    setLocalStorage(newSelectedLanguage, {
      ...selectedLanguageItem,
      [courseId]: newSelectedLanguage,
    });
    close();
  }, [selectedIndex]);

  return {
    selectedIndex,
    setSelectedIndex,
    onSubmit,
  };
};

export default useTranslationSelection;
