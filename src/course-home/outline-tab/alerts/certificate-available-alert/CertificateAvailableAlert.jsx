import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, FormattedRelative } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

import { Alert, ALERT_TYPES } from '../../../../generic/user-messages';

function CertificateAvailableAlert({ payload }) {
  const {
    certDate,
    username,
    userTimezone,
  } = payload;

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  return (
    <Alert type={ALERT_TYPES.INFO}>
      <strong>
        <FormattedMessage
          id="learning.outline.alert.cert.title"
          defaultMessage="We are working on generating course certificates."
        />
      </strong>
      <br />
      <FormattedMessage
        id="learning.outline.alert.cert.when"
        defaultMessage="If you have earned a certificate, you will be able to access it {timeRemaining}. You will also be able to view your certificates on your {profileLink}."
        values={{
          profileLink: (
            <Hyperlink
              destination={`${getConfig().LMS_BASE_URL}/u/${username}`}
            >
              <FormattedMessage
                id="learning.outline.alert.cert.profile"
                defaultMessage="Learner Profile"
              />
            </Hyperlink>
          ),
          timeRemaining: (
            <FormattedRelative
              key="timeRemaining"
              value={certDate}
              {...timezoneFormatArgs}
            />
          ),
        }}
      />
    </Alert>
  );
}

CertificateAvailableAlert.propTypes = {
  payload: PropTypes.shape({
    certDate: PropTypes.string,
    username: PropTypes.string,
    userTimezone: PropTypes.string,
  }).isRequired,
};

export default CertificateAvailableAlert;
