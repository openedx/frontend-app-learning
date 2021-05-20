import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from '@edx/frontend-platform/i18n';

import { Alert, ALERT_TYPES } from '../../../../generic/user-messages';

function CertificateAvailableAlert({ payload }) {
  const {
    certDate,
    courseEndDate,
  } = payload;

  const certificateAvailableDate = <FormattedDate value={certDate} day="numeric" month="long" year="numeric" />;
  const courseEndDateFormatted = <FormattedDate value={courseEndDate} day="numeric" month="long" year="numeric" />;

  return (
    <Alert type={ALERT_TYPES.SUCCESS}>
      <strong>
        <FormattedMessage
          id="learning.outline.alert.cert.title"
          defaultMessage="Your grade and certificate will be ready soon!"
        />
      </strong>
      <br />
      <FormattedMessage
        id="learning.outline.alert.cert.when"
        defaultMessage="This course ended on {courseEndDateFormatted} and final grades and certificates are
        scheduled to be available after {certificateAvailableDate}."
        values={{
          courseEndDateFormatted,
          certificateAvailableDate
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
