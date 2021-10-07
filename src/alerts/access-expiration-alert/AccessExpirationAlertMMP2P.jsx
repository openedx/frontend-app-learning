import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, injectIntl } from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

import messages from './messages';

function AccessExpirationAlertMMP2P({ payload }) {
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
    upgradeDeadline,
    upgradeUrl,
  } = accessExpiration;

  let deadlineMessage = null;
  const formatDate = (val, key) => (
    <FormattedDate
      key={`accessExpiration.${key}`}
      day="numeric"
      month="short"
      year="numeric"
      value={val}
      {...timezoneFormatArgs}
    />
  );

  if (upgradeDeadline && upgradeUrl) {
    deadlineMessage = (
      <>
        Upgrade by {formatDate(upgradeDeadline, 'upgradeDesc')} to unlock unlimited access to all course activities, including graded assignments.
        &nbsp;
        <Hyperlink
          className="font-weight-bold"
          style={{ textDecoration: 'underline' }}
          destination={upgradeUrl}
        >
          {messages.upgradeNow.defaultMessage}
        </Hyperlink>
      </>
    );
  }

  return (
    <Alert variant="info" icon={Info}>
      <span className="font-weight-bold">
        Unlock full course content by {formatDate(upgradeDeadline, 'upgradeTitle')}
      </span>
      <br />
      {deadlineMessage}
      <br />
      You lose all access to the first two weeks of scheduled content
      on {formatDate(expirationDate, 'expirationBody')}.
    </Alert>
  );
}

AccessExpirationAlertMMP2P.propTypes = {
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

export default injectIntl(AccessExpirationAlertMMP2P);
