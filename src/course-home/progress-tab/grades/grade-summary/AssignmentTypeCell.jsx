import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useModel } from '../../../../generic/model-store';

function AssignmentTypeCell({ assignmentType, footnoteMarker, footnoteId }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    gradesFeatureIsLocked,
  } = useModel('progress', courseId);
  return (
    <div className="small">
      {assignmentType}
      {footnoteId && footnoteMarker && (
        <sup>
          <a
            id={`${footnoteId}-ref`}
            className="muted-link"
            href={`#${footnoteId}-footnote`}
            aria-describedby="grade-summary-footnote-label"
            tabIndex={gradesFeatureIsLocked ? '-1' : '0'}
          >
            {footnoteMarker}
          </a>
        </sup>
      )}
    </div>
  );
}

AssignmentTypeCell.propTypes = {
  assignmentType: PropTypes.string.isRequired,
  footnoteId: PropTypes.string,
  footnoteMarker: PropTypes.number,
};

AssignmentTypeCell.defaultProps = {
  footnoteId: '',
  footnoteMarker: null,
};

export default AssignmentTypeCell;
