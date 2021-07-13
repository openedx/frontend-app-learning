import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedDate,
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { Alert, Button } from '@edx/paragon';
import { useDispatch } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { getConfig } from '@edx/frontend-platform';
import certMessages from './messages';
import certStatusMessages from '../../../progress-tab/certificate-status/messages';
import { requestCert } from '../../../data/thunks';

export const CERT_STATUS_TYPE = {
  EARNED_NOT_AVAILABLE: 'earned_but_not_available',
  DOWNLOADABLE: 'downloadable',
  REQUESTING: 'requesting',
  UNVERIFIED: 'unverified',
};

function CertificateStatusAlert({ intl, payload }) {
  const dispatch = useDispatch();
  const {
    certificateAvailableDate,
    certStatus,
    courseEndDate,
    courseId,
    certURL,
    isWebCert,
    userTimezone,
  } = payload;

  // eslint-disable-next-line react/prop-types
  const AlertWrapper = (props) => props.children(props);

  const renderCertAwardedStatus = () => {
    const alertProps = {
      variant: 'success',
      icon: faCheckCircle,
      iconClassName: 'alert-icon text-success-500',
    };
    if (certStatus === CERT_STATUS_TYPE.EARNED_NOT_AVAILABLE) {
      const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};
      const certificateAvailableDateFormatted = <FormattedDate value={certificateAvailableDate} day="numeric" month="long" year="numeric" />;
      const courseEndDateFormatted = <FormattedDate value={courseEndDate} day="numeric" month="long" year="numeric" />;
      alertProps.header = intl.formatMessage(certMessages.certStatusEarnedNotAvailableHeader);
      alertProps.body = (
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
    } else if (certStatus === CERT_STATUS_TYPE.DOWNLOADABLE) {
      alertProps.header = intl.formatMessage(certMessages.certStatusDownloadableHeader);
      if (isWebCert) {
        alertProps.buttonMessage = intl.formatMessage(certStatusMessages.viewableButton);
      } else {
        alertProps.buttonMessage = intl.formatMessage(certStatusMessages.downloadableButton);
      }
      alertProps.buttonVisible = true;
      alertProps.buttonLink = certURL;
    } else if (certStatus === CERT_STATUS_TYPE.REQUESTING) {
      alertProps.header = intl.formatMessage(certMessages.certStatusDownloadableHeader);
      alertProps.buttonMessage = intl.formatMessage(certStatusMessages.requestableButton);
      alertProps.buttonVisible = true;
      alertProps.buttonLink = '';
      alertProps.buttonAction = () => { dispatch(requestCert(courseId)); };
    }
    return alertProps;
  };

  const renderNotIDVerifiedStatus = () => {
    const alertProps = {
      variant: 'warning',
      icon: faExclamationTriangle,
      iconClassName: 'alert-icon text-warning-500',
      header: intl.formatMessage(certStatusMessages.unverifiedHomeHeader),
      buttonMessage: intl.formatMessage(certStatusMessages.unverifiedHomeButton),
      body: intl.formatMessage(certStatusMessages.unverifiedHomeBody),
      buttonVisible: true,
      buttonLink: getConfig().SUPPORT_URL_ID_VERIFICATION,
    };

    return alertProps;
  };

  let alertProps = {};
  switch (certStatus) {
    case CERT_STATUS_TYPE.EARNED_NOT_AVAILABLE:
    case CERT_STATUS_TYPE.DOWNLOADABLE:
    case CERT_STATUS_TYPE.REQUESTING:
      alertProps = renderCertAwardedStatus();
      break;
    case CERT_STATUS_TYPE.UNVERIFIED:
      alertProps = renderNotIDVerifiedStatus();
      break;
    default:
      break;
  }

  return (
    <AlertWrapper {...alertProps}>
      {({
        variant,
        buttonVisible,
        iconClassName,
        icon,
        header,
        body,
        buttonAction,
        buttonLink,
        buttonMessage,
      }) => (
        <Alert variant={variant}>
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center">
            <div className={buttonVisible ? 'col-lg-8' : 'col-auto'}>
              <FontAwesomeIcon icon={icon} className={iconClassName} />
              <Alert.Heading>{header}</Alert.Heading>
              {body}
            </div>
            {buttonVisible && (
              <div className="flex-grow-0 pt-3 pt-lg-0">
                <Button
                  variant="primary"
                  href={buttonLink}
                  onClick={() => {
                    if (buttonAction) { buttonAction(); }
                  }}
                >
                  {buttonMessage}
                </Button>
              </div>
            )}
          </div>
        </Alert>

      )}
    </AlertWrapper>
  );
}

CertificateStatusAlert.propTypes = {
  intl: intlShape.isRequired,
  payload: PropTypes.shape({
    certificateAvailableDate: PropTypes.string,
    certStatus: PropTypes.string,
    courseEndDate: PropTypes.string,
    courseId: PropTypes.string,
    certURL: PropTypes.string,
    isWebCert: PropTypes.bool,
    userTimezone: PropTypes.string,
  }).isRequired,
};

export default injectIntl(CertificateStatusAlert);
