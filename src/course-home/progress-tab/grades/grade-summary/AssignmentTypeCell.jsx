import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Blocked } from '@edx/paragon/icons';
import { Icon } from '@edx/paragon';
import { useModel } from '../../../../generic/model-store';
import messages from '../messages';

function AssignmentTypeCell({
  intl, assignmentType, footnoteMarker, footnoteId, locked,
}) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);

  const lockedIcon = locked ? <Icon id={`assignmentTypeBlockedIcon${assignmentType}`} aria-label={intl.formatMessage(messages.noAccessToAssignmentType, { assignmentType })} className="mr-1 mt-1 d-inline-flex" style={{ height: '1rem', width: '1rem' }} src={Blocked} data-testid="blocked-icon" /> : '';

  return (
    <div className="d-flex small">
      <div className="d-flex">{lockedIcon}</div>
      <div>
        {assignmentType}&nbsp;
        {footnoteId && footnoteMarker && (
          <sup>
            <a
              id={`${footnoteId}-ref`}
              className="muted-link"
              href={`#${footnoteId}-footnote`}
              aria-describedby="grade-summary-footnote-label"
              tabIndex={gradesFeatureIsFullyLocked ? '-1' : '0'}
              aria-labelledby={`assignmentTypeBlockedIcon${assignmentType}`}
            >
              {footnoteMarker}
            </a>
          </sup>
        )}
      </div>
    </div>
  );
}

AssignmentTypeCell.propTypes = {
  intl: intlShape.isRequired,
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

export default injectIntl(AssignmentTypeCell);
