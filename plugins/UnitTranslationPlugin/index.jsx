import React from "react";
import PropTypes from "prop-types";

import { useModel } from "@src/generic/model-store";

import TranslationSelection from "./translation-selection";

const UnitTranslationPlugin = ({ id, courseId }) => {
  const { language, wholeCourseTranslationEnabled } = useModel(
    "courseHomeMeta",
    courseId
  );

  if (!wholeCourseTranslationEnabled || !language) {
    return null;
  }

  return <TranslationSelection id={id} courseId={courseId} language={language} />;
};

UnitTranslationPlugin.propTypes = {
  id: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default UnitTranslationPlugin;
