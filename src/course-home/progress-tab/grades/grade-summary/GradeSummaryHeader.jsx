import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { Blocked, InfoOutline } from '@openedx/paragon/icons';

import messages from '../messages';
import { useModel } from '../../../../generic/model-store';

const GradeSummaryHeader = ({ allOfSomeAssignmentTypeIsLocked }) => {
  const intl = useIntl();
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);

  return (
    <div className="row w-100 m-0 align-items-center">
      <h3 className="h4 mb-3 mr-1">{intl.formatMessage(messages.gradeSummary)}</h3>
      <OverlayTrigger
        trigger="hover"
        placement="top"
        overlay={(
          <Tooltip>
            {intl.formatMessage(messages.gradeSummaryTooltipBody)}
          </Tooltip>
        )}
      >
        <Icon
          alt={intl.formatMessage(messages.gradeSummaryTooltipAlt)}
          src={InfoOutline}
          className="mb-3"
          size="sm"
        />
      </OverlayTrigger>
      {!gradesFeatureIsFullyLocked && allOfSomeAssignmentTypeIsLocked && (
        <div className="mb-3 small ml-0 d-inline">
          <Icon className="mr-1 mt-1 d-inline-flex" style={{ height: '1rem', width: '1rem' }} src={Blocked} data-testid="blocked-icon" />
          {intl.formatMessage(messages.gradeSummaryLimitedAccessExplanation)}
        </div>
      )}
    </div>
  );
};

GradeSummaryHeader.propTypes = {
  allOfSomeAssignmentTypeIsLocked: PropTypes.bool.isRequired,
};

export default GradeSummaryHeader;
