import React from 'react';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  FormattedMessage, FormattedDate, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import { Alert, ALERT_TYPES } from '../../generic/user-messages';
import { FormattedPricing } from '../../generic/upgrade-button';
import messages from './messages';

function OfferAlert({ intl, payload }) {
  const {
    analyticsPageName,
    courseId,
    offer,
    org,
    userTimezone,
  } = payload;

  if (!offer) {
    return null;
  }

  const {
    code,
    expirationDate,
    percentage,
    upgradeUrl,
  } = offer;
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  const logClick = () => {
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      org_key: org,
      courserun_key: courseId,
      linkCategory: 'welcome',
      linkName: `${analyticsPageName}_welcome`,
      linkType: 'link',
      pageName: analyticsPageName,
    });
  };

  return (
    <Alert type={ALERT_TYPES.INFO}>
      <span className="font-weight-bold">
        <FormattedMessage
          id="learning.offer.header"
          defaultMessage="Upgrade by {date} and save {percentage}% [{fullPricing}]"
          values={{
            date: (
              <FormattedDate
                key="offerDate"
                day="numeric"
                month="long"
                value={expirationDate}
                {...timezoneFormatArgs}
              />
            ),
            fullPricing: <FormattedPricing offer={offer} />,
            percentage,
          }}
        />
      </span>
      <br />
      <FormattedMessage
        id="learning.offer.code"
        defaultMessage="Use code {code} at checkout!"
        values={{
          code: (<b>{code}</b>),
        }}
      />
      &nbsp;
      <Hyperlink
        className="font-weight-bold"
        style={{ textDecoration: 'underline' }}
        destination={upgradeUrl}
        onClick={logClick}
      >
        {intl.formatMessage(messages.upgradeNow)}
      </Hyperlink>
    </Alert>
  );
}

OfferAlert.propTypes = {
  intl: intlShape.isRequired,
  payload: PropTypes.shape({
    courseId: PropTypes.string.isRequired,
    offer: PropTypes.shape({
      code: PropTypes.string.isRequired,
      discountedPrice: PropTypes.string.isRequired,
      expirationDate: PropTypes.string.isRequired,
      originalPrice: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired,
      upgradeUrl: PropTypes.string.isRequired,
    }).isRequired,
    org: PropTypes.string.isRequired,
    userTimezone: PropTypes.string.isRequired,
    analyticsPageName: PropTypes.string.isRequired,
  }).isRequired,
};

export default injectIntl(OfferAlert);
