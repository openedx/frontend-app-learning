import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import Timeline from './Timeline';
import DatesBannerContainer from '../dates-banner/DatesBannerContainer';

function DatesTab({ intl }) {
  return (
    <>
      <div role="heading" aria-level="1" className="h4 my-3">
        {intl.formatMessage(messages.title)}
      </div>
      <DatesBannerContainer model="dates" />
      <Timeline />
    </>
  );
}

DatesTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DatesTab);
