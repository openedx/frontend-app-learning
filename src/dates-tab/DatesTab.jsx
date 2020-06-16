import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import Timeline from './Timeline';
import DatesBannerContainer from '../dates-banner/DatesBannerContainer';

function DatesTab({ intl }) {
  return (
    <>
      <DatesBannerContainer model="dates" />
      <h2 className="mb-4">
        {intl.formatMessage(messages.title)}
      </h2>
      <Timeline />
    </>
  );
}

DatesTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DatesTab);
