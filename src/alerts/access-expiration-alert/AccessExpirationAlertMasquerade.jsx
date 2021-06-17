import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from '@edx/frontend-platform/i18n';

import { Alert, ALERT_TYPES } from '../../generic/user-messages';

function AccessExpirationAlertMasquerade({ payload }) {
  const {
    accessExpiration,
    userTimezone,
  } = payload;

  const {
    expirationDate,
  } = accessExpiration;

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  return (
    <Alert type={ALERT_TYPES.INFO}>
      <FormattedMessage
        id="learning.accessExpiration.expired"
        defaultMessage="This learner does not have access to this course. Their access expired on {date}."
        values={{
          date: (
            <FormattedDate
              key="accessExpirationExpiredDate"
              day="numeric"
              month="short"
              year="numeric"
              value={expirationDate}
              {...timezoneFormatArgs}
            />
          ),
        }}
      />
    </Alert>
  );
}

AccessExpirationAlertMasquerade.propTypes = {
  payload: PropTypes.shape({
    accessExpiration: PropTypes.shape({
      expirationDate: PropTypes.string.isRequired,
      masqueradingExpiredCourse: PropTypes.bool.isRequired,
      upgradeDeadline: PropTypes.string,
      upgradeUrl: PropTypes.string,
    }).isRequired,
    userTimezone: PropTypes.string.isRequired,
  }).isRequired,
};

export default AccessExpirationAlertMasquerade;
