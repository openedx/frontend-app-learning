import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage, FormattedDate, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';

import { Alert, ALERT_TYPES } from '../../generic/user-messages';

function AccessExpirationAlert({ payload }) {
  const {
    accessExpiration,
    userTimezone,
  } = payload;
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  if (!accessExpiration) {
    return null;
  }

  const {
    expirationDate,
    masqueradingExpiredCourse,
  } = accessExpiration;

  if (masqueradingExpiredCourse) {
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

  return null;
}

AccessExpirationAlert.propTypes = {
  intl: intlShape.isRequired,
  payload: PropTypes.shape({
    accessExpiration: PropTypes.shape({
      expirationDate: PropTypes.string.isRequired,
      masqueradingExpiredCourse: PropTypes.bool.isRequired,
      upgradeDeadline: PropTypes.string,
      upgradeUrl: PropTypes.string,
    }).isRequired,
    courseId: PropTypes.string.isRequired,
    org: PropTypes.string.isRequired,
    userTimezone: PropTypes.string.isRequired,
    analyticsPageName: PropTypes.string.isRequired,
  }).isRequired,
};

export default injectIntl(AccessExpirationAlert);
