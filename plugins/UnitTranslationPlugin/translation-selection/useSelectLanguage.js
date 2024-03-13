import { useCallback } from 'react';
import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils';
import {
  getLocalStorage,
  setLocalStorage,
} from '@src/data/localStorage';

export const selectedLanguageKey = 'selectedLanguages';
// This will be use to check supported languages
export const languages = Object.entries({
  en: 'English',
  es: 'Spanish',
});

export const getIndexByLanguage = (language) => languages.findIndex(([key]) => key === language);
export const getLanguageByIndex = (index) => languages[index][0];

export const stateKeys = StrictDict({
  selectedLanguage: 'selectedLanguage',
});

const useSelectLanguage = ({ courseId, language }) => {
  const selectedLanguageItem = getLocalStorage(selectedLanguageKey) || {};
  const [selectedLanguage, updateSelectedLanguage] = useKeyedState(
    stateKeys.selectedLanguage,
    selectedLanguageItem[courseId] || language,
  );

  const setSelectedLanguage = useCallback((newSelectedLanguage) => {
    setLocalStorage(selectedLanguageKey, {
      ...selectedLanguageItem,
      [courseId]: newSelectedLanguage,
    });
    updateSelectedLanguage(newSelectedLanguage);
  });

  return {
    selectedLanguage,
    setSelectedLanguage,
  };
};

export default useSelectLanguage;
