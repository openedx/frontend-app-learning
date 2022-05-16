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
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
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
    userTimezone,
    org,
    notPassingCourseEnded,
    tabs,
  } = payload;

  // eslint-disable-next-line react/prop-types
  const AlertWrapper = (props) => props.children(props);

  const sendAlertClickTracking = (id) => {
    const { administrator } = getAuthenticatedUser();
    sendTrackEvent(id, {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
    });
  };

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
            id="learning.outline.alert.cert.earnedNotAvailable"
            defaultMessage="This course ends on {courseEndDateFormatted}. Final grades and any earned certificates are
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
      alertProps.buttonMessage = intl.formatMessage(certStatusMessages.viewableButton);
      alertProps.buttonVisible = true;
      alertProps.buttonLink = certURL;
      alertProps.buttonAction = () => {
        sendAlertClickTracking('edx.ui.lms.course_outline.certificate_alert_downloadable_button.clicked');
      };
    } else if (certStatus === CERT_STATUS_TYPE.REQUESTING) {
      alertProps.header = intl.formatMessage(certMessages.certStatusDownloadableHeader);
      alertProps.buttonMessage = intl.formatMessage(certStatusMessages.requestableButton);
      alertProps.buttonVisible = true;
      alertProps.buttonLink = '';
      alertProps.buttonAction = () => {
        sendAlertClickTracking('edx.ui.lms.course_outline.certificate_alert_request_cert_button.clicked');
        dispatch(requestCert(courseId));
      };
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
      buttonAction: () => {
        sendAlertClickTracking('edx.ui.lms.course_outline.certificate_alert_unverified_button.clicked');
      },
    };

    return alertProps;
  };

  const renderNotPassingCourseEnded = () => {
    const progressTab = tabs.find(tab => tab.slug === 'progress');
    const progressLink = progressTab && progressTab.url;

    const alertProps = {
      header: intl.formatMessage(certMessages.certStatusNotPassingHeader),
      buttonMessage: intl.formatMessage(certMessages.certStatusNotPassingButton),
      body: intl.formatMessage(certStatusMessages.notPassingBody),
      buttonVisible: true,
      buttonLink: progressLink,
      buttonAction: () => {
        sendAlertClickTracking('edx.ui.lms.course_outline.certificate_alert_view_grades_button.clicked');
      },
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
      if (notPassingCourseEnded) {
        alertProps = renderNotPassingCourseEnded();
      }
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
    userTimezone: PropTypes.string,
    org: PropTypes.string,
    notPassingCourseEnded: PropTypes.bool,
    tabs: PropTypes.arrayOf(PropTypes.shape({
      tab_id: PropTypes.string,
      title: PropTypes.string,
      url: PropTypes.string,
    })),
  }).isRequired,
};

export default injectIntl(CertificateStatusAlert);
