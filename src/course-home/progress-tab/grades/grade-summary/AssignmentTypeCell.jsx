import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Blocked } from '@edx/paragon/icons';
import { Icon } from '@edx/paragon';
import { useModel } from '../../../../generic/model-store';

function AssignmentTypeCell({
  assignmentType, footnoteMarker, footnoteId, locked,
}) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);

  const lockedIcon = locked ? <Icon className="mr-1 mt-1" style={{ height: '1rem', width: '1rem' }} src={Blocked} data-testid="blocked-icon" /> : '';

  return (
    <div className="small">
      <span className="d-inline-flex">{lockedIcon}{assignmentType}</span>
      {footnoteId && footnoteMarker && (
        <sup>
          <a
            id={`${footnoteId}-ref`}
            className="muted-link"
            href={`#${footnoteId}-footnote`}
            aria-describedby="grade-summary-footnote-label"
            tabIndex={gradesFeatureIsFullyLocked ? '-1' : '0'}
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
  locked: PropTypes.bool,
};

AssignmentTypeCell.defaultProps = {
  footnoteId: '',
  footnoteMarker: null,
  locked: false,
};

export default AssignmentTypeCell;
