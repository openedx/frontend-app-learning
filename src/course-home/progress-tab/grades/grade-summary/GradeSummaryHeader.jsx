import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, OverlayTrigger, Popover } from '@edx/paragon';
import { InfoOutline } from '@edx/paragon/icons';

import messages from '../messages';

function GradeSummaryHeader({ intl }) {
  return (
    <div className="row w-100 m-0 align-items-center">
      <h3 className="h4 mb-3 mr-2">{intl.formatMessage(messages.gradeSummary)}</h3>
      <OverlayTrigger
        trigger={['hover', 'click']}
        placement="top"
        overlay={(
          <Popover>
            <Popover.Content className="small text-dark-700">
              {intl.formatMessage(messages.gradeSummaryTooltip)}
            </Popover.Content>
          </Popover>
        )}
      >
        <Icon src={InfoOutline} className="mb-3" style={{ height: '1rem', width: '1rem' }} />
      </OverlayTrigger>
    </div>
  );
}

GradeSummaryHeader.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(GradeSummaryHeader);
