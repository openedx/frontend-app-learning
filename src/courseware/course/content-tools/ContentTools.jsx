import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Calculator from './calculator';
import NotesVisibility from './notes-visibility';

const ContentTools = ({
  course,
}) => {
  const {
    sidebarIsOpen,
  } = useSelector(state => state.learningAssistant);

  return (
    !sidebarIsOpen && (
      <div className="content-tools">
        <div className="d-flex justify-content-end align-items-end m-0">
          {course.showCalculator && (
            <Calculator />
          )}
          {course.notes.enabled && (
            <NotesVisibility course={course} />
          )}
        </div>
      </div>
    )
  );
};

ContentTools.propTypes = {
  course: PropTypes.shape({
    notes: PropTypes.shape({
      enabled: PropTypes.bool,
    }),
    showCalculator: PropTypes.bool,
  }).isRequired,
};

export default ContentTools;
