import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedDate,
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { Alert, Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import certMessages from './messages';
import certStatusMessages from '../../../progress-tab/certificate-status/messages';
import { IdVerificationSupportLink } from '../../../../shared/links';
import { getConfig } from '@edx/frontend-platform';

export const CERT_STATUS_TYPE = {
  EARNED_NOT_AVAILABLE: 'earned_but_not_available',
  DOWNLOADABLE: 'downloadable',
  UNVERIFIED: 'unverified',
};

function CertificateStatusAlert({ intl, payload }) {
  const {
    certificateAvailableDate,
    certStatusType,
    courseEndDate,
    certURL,
    isWebCert,
    userTimezone,
  } = payload;

  let variant = '';
  let icon = '';
  let iconClassName = '';
  if (certStatusType === CERT_STATUS_TYPE.EARNED_NOT_AVAILABLE || certStatusType === CERT_STATUS_TYPE.DOWNLOADABLE) {
    variant = 'success';
    icon = faCheckCircle;
    iconClassName = 'alert-icon text-success-500';
  }

  if (certStatusType === CERT_STATUS_TYPE.UNVERIFIED) {
    variant = 'warning';
    icon = faExclamationTriangle;
    iconClassName = 'alert-icon text-warning-500';
  }

  let header = '';
  let body = '';
  let buttonVisible = false;
  let buttonMessage = '';
  let buttonLink = '';
  if (certStatusType === CERT_STATUS_TYPE.EARNED_NOT_AVAILABLE) {
    const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};
    const certificateAvailableDateFormatted = <FormattedDate value={certificateAvailableDate} day="numeric" month="long" year="numeric" />;
    const courseEndDateFormatted = <FormattedDate value={courseEndDate} day="numeric" month="long" year="numeric" />;

    header = intl.formatMessage(certMessages.certStatusEarnedNotAvailableHeader);
    body = (
      <p>
        <FormattedMessage
          id="learning.outline.alert.cert.when"
          defaultMessage="This course ended on {courseEndDateFormatted}. Final grades and certificates are
          scheduled to be available after {certificateAvailableDate}."
          values={{
            courseEndDateFormatted,
            certificateAvailableDate: certificateAvailableDateFormatted,
          }}
          {...timezoneFormatArgs}
        />
      </p>
    );
  } else if (certStatusType === CERT_STATUS_TYPE.DOWNLOADABLE) {
    header = intl.formatMessage(certMessages.certStatusDownloadableHeader);
    if (isWebCert) {
      buttonMessage = intl.formatMessage(certStatusMessages.viewableButton);
    } else {
      buttonMessage = intl.formatMessage(certStatusMessages.downloadableButton);
    }
    buttonVisible = true;
    buttonLink = certURL;
  } else if (certStatusType === CERT_STATUS_TYPE.UNVERIFIED) {
    header = intl.formatMessage(certStatusMessages.unverifiedHomeHeader);
    buttonMessage = intl.formatMessage(certStatusMessages.unverifiedHomeButton);
    body = intl.formatMessage(certStatusMessages.unverifiedHomeBody);
    buttonVisible = true;
    buttonLink = getConfig().SUPPORT_URL_ID_VERIFICATION;
  }
  return (
    <Alert variant={variant}>
      <div className="row justify-content-between align-items-center">
        <div className={buttonVisible ? '' : 'col-auto'}>
          <FontAwesomeIcon icon={icon} className={iconClassName} />
          <Alert.Heading>{header}</Alert.Heading>
          {body}
        </div>
        {buttonVisible && (
          <div className="m-auto m-lg-0 pr-lg-3">
            <Button
              variant="primary"
              href={buttonLink}
            >
              {buttonMessage}
            </Button>
          </div>
        )}
      </div>
    </Alert>
  );
}

CertificateStatusAlert.propTypes = {
  intl: intlShape.isRequired,
  payload: PropTypes.shape({
    certificateAvailableDate: PropTypes.string,
    certStatusType: PropTypes.string,
    courseEndDate: PropTypes.string,
    certURL: PropTypes.string,
    isWebCert: PropTypes.bool,
    userTimezone: PropTypes.string,
  }).isRequired,
};

export default injectIntl(CertificateStatusAlert);
