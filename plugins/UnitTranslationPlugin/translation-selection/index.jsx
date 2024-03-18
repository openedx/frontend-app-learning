import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { AppContext } from '@edx/frontend-platform/react';
import { IconButton, Icon, ProductTour } from '@edx/paragon';
import { Language } from '@edx/paragon/icons';
import { useDispatch } from 'react-redux';
import { stringifyUrl } from 'query-string';

import { registerOverrideMethod } from '@src/generic/plugin-store';

import TranslationModal from './TranslationModal';
import useTranslationTour from './useTranslationTour';
import useSelectLanguage from './useSelectLanguage';
import FeedbackWidget from '../feedback-widget';

const TranslationSelection = ({
  id, courseId, language, availableLanguages, unitId,
}) => {
  const {
    authenticatedUser: { userId },
  } = useContext(AppContext);
  const dispatch = useDispatch();
  const {
    translationTour, isOpen, open, close,
  } = useTranslationTour();

  const { selectedLanguage, setSelectedLanguage } = useSelectLanguage({
    courseId,
    language,
  });

  useEffect(() => {
    dispatch(
      registerOverrideMethod({
        pluginName: id,
        methodName: 'getIFrameUrl',
        method: (iframeUrl) => {
          const finalUrl = stringifyUrl({
            url: iframeUrl,
            query: {
              ...(language
                && selectedLanguage
                && language !== selectedLanguage && {
                src_lang: language,
                dest_lang: selectedLanguage,
              }),
            },
          });
          return finalUrl;
        },
      }),
    );
  }, [language, selectedLanguage]);

  return (
    <>
      <ProductTour tours={[translationTour]} />
      <IconButton
        src={Language}
        iconAs={Icon}
        alt="change-language"
        onClick={open}
        variant="primary"
        className="mr-2 mb-2 float-right"
        id="translation-selection-button"
      />
      <TranslationModal
        isOpen={isOpen}
        close={close}
        courseId={courseId}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        availableLanguages={availableLanguages}
        id={id}
      />
      <FeedbackWidget
        courseId={courseId}
        translationLanguage={selectedLanguage}
        unitId={unitId}
        userId={userId}
      />
    </>
  );
};

TranslationSelection.propTypes = {
  id: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  availableLanguages: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
};

TranslationSelection.defaultProps = {};

export default TranslationSelection;
