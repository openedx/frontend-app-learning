import React from 'react';

import {
  FormattedDate, FormattedMessage, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button, Hyperlink } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import celebration from './assets/celebration_456x328.gif';
import certificate from './assets/certificate.png';
import messages from './messages';
import { useModel } from '../../../generic/model-store';
import { requestCert } from '../../../course-home/data/thunks';

function CourseCelebration({ intl }) {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const {
    certificateData,
    end,
    verifyIdentityUrl,
  } = useModel('courses', courseId);

  const {
    certStatus,
    certWebViewUrl,
    downloadUrl,
  } = certificateData || { downloadUrl: 'google.com', certWebViewUrl: 'duckduckgo.com' };

  const { username } = getAuthenticatedUser();

  const dashboardLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().LMS_BASE_URL}/dashboard`}
    >
      {intl.formatMessage(messages.dashboardLink)}
    </Hyperlink>
  );
  const idVerificationSupportLink = getConfig().SUPPORT_URL && (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().SUPPORT_URL}/hc/en-us/articles/206503858-How-do-I-verify-my-identity`}
    >
      {intl.formatMessage(messages.idVerificationSupportLink)}
    </Hyperlink>
  );
  const profileLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().LMS_BASE_URL}/u/${username}`}
    >
      {intl.formatMessage(messages.profileLink)}
    </Hyperlink>
  );

  let buttonLocation;
  let buttonText;
  let message;
  let title;
  // These cases are taken from the edx-platform `get_cert_data` function found in lms/courseware/views/views.py
  switch (certStatus) {
    case 'downloadable':
      title = intl.formatMessage(messages.certificateHeaderDownloadable);
      message = (
        <FormattedMessage
          id="courseCelebration.certificateBody.available"
          defaultMessage="
            Showcase your accomplishment on LinkedIn or your resumé today.
            You can download your certificate now and access it any time from your
            {dashboardLink} and {profileLink}."
          description="Body in certificate banner"
          values={{ dashboardLink, profileLink }}
        />
      );
      if (certWebViewUrl) {
        buttonLocation = `${getConfig().LMS_BASE_URL}${certWebViewUrl}`;
        buttonText = intl.formatMessage(messages.viewCertificateButton);
      } else if (downloadUrl) {
        buttonLocation = downloadUrl;
        buttonText = intl.formatMessage(messages.downloadButton);
      }
      break;
    case 'earned_but_not_available': {
      const endDate = <FormattedDate value={end} day="numeric" month="long" year="numeric" />;
      title = intl.formatMessage(messages.certificateHeaderNotAvailable);
      message = (
        <FormattedMessage
          id="courseCelebration.certificateBody.notAvailable"
          defaultMessage="
            After this course officially ends on {endDate}, you will receive an
            email notification with your certificate. Once you have your certificate,
            be sure to showcase your accomplishment on LinkedIn or your resumé.
            You will be able to access your certificate any time from your
            {dashboardLink} and {profileLink}."
          description="Body in certificate banner"
          values={{ endDate, dashboardLink, profileLink }}
        />
      );
      break;
    }
    case 'requesting':
      buttonText = intl.formatMessage(messages.requestCertificateButton);
      title = intl.formatMessage(messages.certificateHeaderRequestable);
      message = intl.formatMessage(messages.requestCertificateBodyText);
      break;
    case 'unverified':
      buttonText = intl.formatMessage(messages.verifyIdentityButton);
      buttonLocation = verifyIdentityUrl;
      title = intl.formatMessage(messages.certificateHeaderUnverified);
      message = (
        <FormattedMessage
          id="courseCelebration.certificateBody.unverified"
          defaultMessage="In order to generate a certificate, you must complete ID verification.
            {idVerificationSupportLink} now."
          description="Body in certificate banner"
          values={{ idVerificationSupportLink }}
        />
      );
      break;
    default:
      break;
  }

  return (
    <>
      <Helmet>
        <title>{`Congratulations! | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <div className="align-items-center d-flex flex-column border border-light p-3 mb-3 mt-5">
        <h2>{ intl.formatMessage(messages.congratulationsHeader) }</h2>
        <div className="mb-3 h4 font-weight-normal">{ intl.formatMessage(messages.shareHeader) }</div>
        <div className="mb-5"><img src={celebration} alt="" className="img-fluid" /></div>
        <div className="d-flex flex-row p-4 mb-3 bg-primary-100">
          <div className="d-flex flex-column justify-content-between">
            <div className="h4 mb-0">{title}</div>
            {message}
            {/* The requesting status needs a different button because it does a POST instead of a GET */}
            {certStatus === 'requesting' ? (
              <div>
                <Button variant="outline-primary" onClick={() => dispatch(requestCert(courseId))} style={{ backgroundColor: '#FFFFFF' }}>
                  {buttonText}
                </Button>
              </div>
            ) : (
              <div>
                <Button variant="outline-primary" href={buttonLocation} style={{ backgroundColor: '#FFFFFF' }}>
                  {buttonText}
                </Button>
              </div>
            )}
          </div>
          {certStatus !== 'unverified' && (
            <div className="col-3"><img src={certificate} alt="" className="img-fluid" /></div>
          )}
        </div>
        <div className="mb-3 text-gray-500">
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" style={{ width: '20px' }} />
          <FormattedMessage
            id="courseCelebration.dashboardInfo"
            defaultMessage="You can always access this course and its materials on your {dashboardLink}."
            description="Text letting the user know they can view their dashboard"
            values={{ dashboardLink }}
          />
        </div>
      </div>
    </>
  );
}

CourseCelebration.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseCelebration);
