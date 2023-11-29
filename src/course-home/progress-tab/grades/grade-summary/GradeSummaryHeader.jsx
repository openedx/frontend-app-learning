import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Icon, Button, OverlayTrigger, Popover,
} from '@edx/paragon';
import { Blocked } from '@edx/paragon/icons';

import messages from '../messages';
import { useModel } from '../../../../generic/model-store';
import { InfoIcon } from '../../../../Icons';

const GradeSummaryHeader = ({ intl, allOfSomeAssignmentTypeIsLocked }) => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="row w-100 m-0 align-items-center">
      <h3 className="h2 mb-4 mr-1">{intl.formatMessage(messages.gradeSummary)}</h3>
      <OverlayTrigger
        trigger="click"
        placement="top"
        show={showTooltip}
        overlay={(
          <Popover>
            <Popover.Content className="text-dark-700">
              {intl.formatMessage(messages.gradeSummaryTooltipBody)}
            </Popover.Content>
          </Popover>
        )}
      >
        <Button
          onClick={() => { setShowTooltip(!showTooltip); }}
          onBlur={() => { setShowTooltip(false); }}
          variant="link"
          size="inline"
          className="mb-3"
          disabled={gradesFeatureIsFullyLocked}
        >
          <InfoIcon />
          <span className="sr-only">{intl.formatMessage(messages.gradeSummaryTooltipAlt)}</span>
        </Button>
      </OverlayTrigger>
      {!gradesFeatureIsFullyLocked && allOfSomeAssignmentTypeIsLocked && (
        <div className="mb-3 ml-0 d-inline">
          <Icon className="mr-1 mt-1 d-inline-flex" style={{ height: '1rem', width: '1rem' }} src={Blocked} data-testid="blocked-icon" />
          {intl.formatMessage(messages.gradeSummaryLimitedAccessExplanation)}
        </div>
      )}
    </div>
  );
};

GradeSummaryHeader.propTypes = {
  intl: intlShape.isRequired,
  allOfSomeAssignmentTypeIsLocked: PropTypes.bool.isRequired,
};

export default injectIntl(GradeSummaryHeader);
