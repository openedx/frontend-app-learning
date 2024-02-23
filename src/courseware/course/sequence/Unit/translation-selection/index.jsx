import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Icon, ProductTour } from '@edx/paragon';
import { Language } from '@edx/paragon/icons';
import TranslationModal from './TranslationModal';
import useTranslationTour from './useTranslationTour';

const TranslationSelection = ({ courseId }) => {
  const {
    translationTour, isOpen, open, close,
  } = useTranslationTour();

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
      <TranslationModal isOpen={isOpen} close={close} courseId={courseId} />
    </>
  );
};

TranslationSelection.propTypes = {
  courseId: PropTypes.string.isRequired,
};

TranslationSelection.defaultProps = {};

export default TranslationSelection;
