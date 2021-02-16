import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage, FormattedDate, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import { Alert, ALERT_TYPES } from '../../generic/user-messages';
import messages from './messages';
import AccessExpirationAlertMMP2P from './AccessExpirationAlertMMP2P';

function AccessExpirationAlert({ intl, payload }) {
  /** [MM-P2P] Experiment */
  const [showMMP2P, setShowMMP2P] = useState(!!window.experiment__home_alert_bShowMMP2P);
  if (window.experiment__home_alert_showMMP2P === undefined) {
    window.experiment__home_alert_showMMP2P = (val) => {
      window.experiment__home_alert_bShowMMP2P = !!val;
      setShowMMP2P(!!val);
    };
  }

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
    upgradeDeadline,
    upgradeUrl,
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

  /** [MM-P2P] Experiment */
  if (showMMP2P) {
    return (
      <AccessExpirationAlertMMP2P payload={payload} />
    );
  }

  let deadlineMessage = null;
  if (upgradeDeadline && upgradeUrl) {
    deadlineMessage = (
      <>
        <br />
        <FormattedMessage
          id="learning.accessExpiration.deadline"
          defaultMessage="Upgrade by {date} to get unlimited access to the course as long as it exists on the site."
          values={{
            date: (
              <FormattedDate
                key="accessExpirationUpgradeDeadline"
                day="numeric"
                month="short"
                year="numeric"
                value={upgradeDeadline}
                {...timezoneFormatArgs}
              />
            ),
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
      </>
    );
  }

  return (
    <Alert type={ALERT_TYPES.INFO}>
      <span className="font-weight-bold">
        <FormattedMessage
          id="learning.accessExpiration.header"
          defaultMessage="Audit Access Expires {date}"
          values={{
            date: (
              <FormattedDate
                key="accessExpirationHeaderDate"
                day="numeric"
                month="short"
                year="numeric"
                value={expirationDate}
                {...timezoneFormatArgs}
              />
            ),
          }}
        />
      </span>
      <br />
      <FormattedMessage
        id="learning.accessExpiration.body"
        defaultMessage="You lose all access to this course, including your progress, on {date}."
        values={{
          date: (
            <FormattedDate
              key="accessExpirationBodyDate"
              day="numeric"
              month="short"
              year="numeric"
              value={expirationDate}
              {...timezoneFormatArgs}
            />
          ),
        }}
      />
      {deadlineMessage}
    </Alert>
  );
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
    userTimezone: PropTypes.string.isRequired,
  }).isRequired,
};

export default injectIntl(AccessExpirationAlert);
