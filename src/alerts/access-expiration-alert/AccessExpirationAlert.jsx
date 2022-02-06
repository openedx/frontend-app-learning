import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import {
  FormattedMessage, FormattedDate, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Alert, Hyperlink } from '@edx/paragon';
import { Info } from '@edx/paragon/icons';

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
    courseId,
    org,
    userTimezone,
    analyticsPageName,
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

  /** [MM-P2P] Experiment */
  if (showMMP2P) {
    return (
      <AccessExpirationAlertMMP2P payload={payload} />
    );
  }

  const logClick = () => {
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      org_key: org,
      courserun_key: courseId,
      linkCategory: 'FBE_banner',
      linkName: `${analyticsPageName}_audit_access_expires`,
      linkType: 'link',
      pageName: analyticsPageName,
    });
  };

  let deadlineMessage = null;
  if (upgradeDeadline && upgradeUrl) {
    deadlineMessage = (
      <>
        <br />
        <FormattedMessage
          id="learning.accessExpiration.deadline"
          defaultMessage="Upgrade by {date} to get unlimited access to the course as long as it exists on the site."
          description="Warning shown to learner to upgrade while they are enrolled on the audit version and it's possible to upgrade"
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
          onClick={logClick}
        >
          {intl.formatMessage(messages.upgradeNow)}
        </Hyperlink>
      </>
    );
  }

  return (
    <Alert variant="info" icon={Info}>
      <span className="font-weight-bold">
        <FormattedMessage
          id="learning.accessExpiration.header"
          defaultMessage="Audit Access Expires {date}"
          description="Headline for auditing deadline"
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
        description="Message body to tell learner the consequences of course expiration."
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
    courseId: PropTypes.string.isRequired,
    org: PropTypes.string.isRequired,
    userTimezone: PropTypes.string.isRequired,
    analyticsPageName: PropTypes.string.isRequired,
  }).isRequired,
};

export default injectIntl(AccessExpirationAlert);
