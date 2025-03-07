import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Locked } from '@openedx/paragon/icons';
import { Icon } from '@openedx/paragon';
import { useContextId } from '../../../../data/hooks';
import { useModel } from '../../../../generic/model-store';
import messages from '../messages';

const AssignmentTypeCell = ({
  assignmentType, footnoteMarker, footnoteId, locked,
}) => {
  const intl = useIntl();
  const courseId = useContextId();

  const {
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);

  const lockedIcon = locked ? <Icon id={`assignmentTypeBlockedIcon${assignmentType}`} aria-label={intl.formatMessage(messages.noAccessToAssignmentType, { assignmentType })} className="mr-1 mt-1 d-inline-flex" style={{ height: '1rem', width: '1rem' }} src={Locked} data-testid="locked-icon" /> : '';

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
};

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
