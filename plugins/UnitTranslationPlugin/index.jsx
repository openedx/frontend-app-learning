import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useModel } from '@src/generic/model-store';
import { VERIFIED_MODES } from '@src/constants';

import TranslationSelection from './translation-selection';
import { fetchTranslationConfig } from './data/api';

const UnitTranslationPlugin = ({ id, courseId, unitId }) => {
  const { language, enrollmentMode } = useModel('coursewareMeta', courseId);
  const { isStaff } = useModel('courseHomeMeta', courseId);
  const [translationConfig, setTranslationConfig] = useState({
    enabled: false,
    availableLanguages: [],
  });

  const hasVerifiedEnrollment = isStaff || (
    enrollmentMode !== null
    && enrollmentMode !== undefined
    && VERIFIED_MODES.includes(enrollmentMode)
  );

  useEffect(() => {
    if (hasVerifiedEnrollment) {
      fetchTranslationConfig(courseId).then(setTranslationConfig);
    }
  }, []);

  const { enabled, availableLanguages } = translationConfig;

  if (!hasVerifiedEnrollment || !enabled || !language || !availableLanguages.length) {
    return null;
  }

  return (
    <TranslationSelection
      id={id}
      courseId={courseId}
      language={language}
      availableLanguages={availableLanguages}
      unitId={unitId}
    />
  );
};

UnitTranslationPlugin.propTypes = {
  id: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
};

export default UnitTranslationPlugin;
