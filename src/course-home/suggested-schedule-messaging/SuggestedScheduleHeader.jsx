import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

function SuggestedScheduleHeader({ intl }) {
  return (
    <p className="large">
      {intl.formatMessage(messages.suggestedSchedule)}
    </p>
  );
}

SuggestedScheduleHeader.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SuggestedScheduleHeader);
