import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';

import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useModel } from '@src/generic/model-store';

import TranslationSelection from './translation-selection';
import FeedbackWidget from './feedback-widget';
import useSelectLanguage from './translation-selection/useSelectLanguage';

const UnitTranslationPlugin = ({ id, courseId }) => {
  const [unitId, setUnitId] = useState('');
  const { authenticatedUser: { userId } } = React.useContext(AppContext);
  const { language, wholeCourseTranslationEnabled } = useModel(
    'courseHomeMeta',
    courseId,
  );
  const { selectedLanguage, setSelectedLanguage } = useSelectLanguage({
    courseId,
    language,
  });

  if (!wholeCourseTranslationEnabled || !language) {
    return null;
  }

  useEffect(() => {
    const { pathname } = window.location;
    const currentUnitId = pathname.substring(pathname.lastIndexOf('/') + 1);
    setUnitId(currentUnitId);
  }, [window.location.search]);

  useEffect(() => {
    const feedbackWidget = (
      <IntlProvider locale="en">
        <FeedbackWidget
          courseId={courseId}
          translationLanguage={selectedLanguage}
          unitId={unitId}
          userId={userId}
        />
      </IntlProvider>
    );
    const domNode = document.getElementById('whole-course-translation-feedback-widget');
    render(feedbackWidget, domNode);
  }, [
    courseId,
    selectedLanguage,
    unitId,
    userId,
  ]);

  return (
    <>
      <TranslationSelection
        id={id}
        courseId={courseId}
        language={language}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
    </>
  );
};

UnitTranslationPlugin.propTypes = {
  id: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default UnitTranslationPlugin;
