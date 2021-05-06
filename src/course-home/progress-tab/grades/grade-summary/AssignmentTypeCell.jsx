import React from 'react';
import PropTypes from 'prop-types';

function AssignmentTypeCell({ assignmentType, footnoteMarker, footnoteId }) {
  return (
    <div className="small">
      {assignmentType}
      {footnoteId && footnoteMarker && (
        <sup>
          <a id={`${footnoteId}-ref`} className="text-dark-700" href={`#${footnoteId}-footnote`} aria-describedby="grade-summary-footnote-label">
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
  footnoteMarker: '',
};

export default AssignmentTypeCell;
