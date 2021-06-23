import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Icon, IconButton, OverlayTrigger, Popover,
} from '@edx/paragon';
import { InfoOutline } from '@edx/paragon/icons';

import messages from '../messages';

function GradeSummaryHeader({ intl }) {
  const {
    gradesFeatureIsLocked,
  } = useSelector(state => state.courseHome);
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="row w-100 m-0 align-items-center">
      <h3 className="h4 mb-3 mr-1">{intl.formatMessage(messages.gradeSummary)}</h3>
      <OverlayTrigger
        trigger="click"
        placement="top"
        show={showTooltip}
        overlay={(
          <Popover>
            <Popover.Content className="small text-dark-700">
              {intl.formatMessage(messages.gradeSummaryTooltipBody)}
            </Popover.Content>
          </Popover>
        )}
      >
        <IconButton
          onClick={() => { setShowTooltip(!showTooltip); }}
          onBlur={() => { setShowTooltip(false); }}
          alt={intl.formatMessage(messages.gradeSummaryTooltipAlt)}
          src={InfoOutline}
          iconAs={Icon}
          className="mb-3"
          size="sm"
          disabled={gradesFeatureIsLocked}
        />
      </OverlayTrigger>
    </div>
  );
}

GradeSummaryHeader.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(GradeSummaryHeader);
