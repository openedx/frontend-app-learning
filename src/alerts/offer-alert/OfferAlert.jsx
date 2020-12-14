import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage, FormattedDate, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import { Alert, ALERT_TYPES } from '../../generic/user-messages';
import messages from './messages';

function OfferAlert({ intl, payload }) {
  const {
    offer,
    userTimezone,
  } = payload;

  if (!offer) {
    return null;
  }

  const {
    code,
    discountedPrice,
    expirationDate,
    originalPrice,
    percentage,
    upgradeUrl,
  } = offer;
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  const fullPricing = (
    <>
      <span className="sr-only">
        {intl.formatMessage(messages.srPrices, { discountedPrice, originalPrice })}
      </span>
      <span aria-hidden="true">
        {discountedPrice} <del>{originalPrice}</del>
      </span>
    </>
  );

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
            fullPricing,
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
      >
        {intl.formatMessage(messages.upgradeNow)}
      </Hyperlink>
    </Alert>
  );
}

OfferAlert.propTypes = {
  intl: intlShape.isRequired,
  payload: PropTypes.shape({
    offer: PropTypes.shape({
      code: PropTypes.string.isRequired,
      discountedPrice: PropTypes.string.isRequired,
      expirationDate: PropTypes.string.isRequired,
      originalPrice: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired,
      upgradeUrl: PropTypes.string.isRequired,
    }).isRequired,
    userTimezone: PropTypes.string.isRequired,
  }).isRequired,
};

export default injectIntl(OfferAlert);
