import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useModel } from '@src/generic/model-store';

import TranslationSelection from './translation-selection';
import { fetchTranslationConfig } from './data/api';

const UnitTranslationPlugin = ({ id, courseId, unitId }) => {
  const { language } = useModel('coursewareMeta', courseId);
  const [translationConfig, setTranslationConfig] = useState({
    enabled: false,
    availableLanguages: [],
  });

  useEffect(() => {
    fetchTranslationConfig(courseId).then(setTranslationConfig);
  }, []);

  const { enabled, availableLanguages } = translationConfig;

  if (!enabled || !language || !availableLanguages.length) {
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
