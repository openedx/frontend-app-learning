import React from 'react';

import {
  FormattedDate, FormattedMessage, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { layoutGenerator } from 'react-break';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { LinkedinIcon } from 'react-share';
import { Alert, Button, Hyperlink } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import CelebrationMobile from './assets/celebration_456x328.gif';
import CelebrationDesktop from './assets/celebration_750x540.gif';
import certificate from './assets/edx_certificate.png';
import messages from './messages';
import { useModel } from '../../../generic/model-store';
import { requestCert } from '../../../course-home/data/thunks';
import DashboardFootnote from './DashboardFootnote';

const LINKEDIN_BLUE = '#007fb1';

function CourseCelebration({ intl }) {
  const layout = layoutGenerator({
    mobile: 0,
    tablet: 768,
  });

  const OnMobile = layout.is('mobile');
  const OnAtLeastTablet = layout.isAtLeast('tablet');

  const { courseId } = useSelector(state => state.courseware);
  const dispatch = useDispatch();
  const {
    certificateData,
    end,
    linkedinAddToProfileUrl,
    verifyIdentityUrl,
  } = useModel('courses', courseId);

  const {
    certStatus,
    certWebViewUrl,
    downloadUrl,
  } = certificateData;

  const { administrator, username } = getAuthenticatedUser();

  const dashboardLink = (
    <Hyperlink
      className="text-gray-700"
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().LMS_BASE_URL}/dashboard`}
    >
      {intl.formatMessage(messages.dashboardLink)}
    </Hyperlink>
  );
  // todo: remove this hardcoded link to edX support
  const idVerificationSupportLink = getConfig().SUPPORT_URL && (
    <Hyperlink
      className="text-gray-700"
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().SUPPORT_URL}/hc/en-us/articles/206503858-How-do-I-verify-my-identity`}
    >
      {intl.formatMessage(messages.idVerificationSupportLink)}
    </Hyperlink>
  );
  const profileLink = (
    <Hyperlink
      className="text-gray-700"
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().LMS_BASE_URL}/u/${username}`}
    >
      {intl.formatMessage(messages.profileLink)}
    </Hyperlink>
  );

  const logClick = (service) => {
    sendTrackEvent('edx.ui.lms.course_celebration.linkedin_add_to_profile.clicked', {
      course_id: courseId,
      is_staff: administrator,
      service,
    });
  };

  let buttonLocation;
  let buttonText;
  let message;
  let title;
  // These cases are taken from the edx-platform `get_cert_data` function found in lms/courseware/views/views.py
  switch (certStatus) {
    case 'downloadable':
      title = intl.formatMessage(messages.certificateHeaderDownloadable);
      message = (
        <p>
          <FormattedMessage
            id="courseCelebration.certificateBody.available"
            defaultMessage="
              Showcase your accomplishment on LinkedIn or your resumé today.
              You can download your certificate now and access it any time from your
              {dashboardLink} and {profileLink}."
            values={{ dashboardLink, profileLink }}
          />
        </p>
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
        <>
          <p>
            <FormattedMessage
              id="courseCelebration.certificateBody.notAvailable.endDate"
              defaultMessage="After this course officially ends on {endDate}, you will receive an
                email notification with your certificate. Once you have your certificate, be sure
                to showcase your accomplishment on LinkedIn or your resumé."
              values={{ endDate }}
            />
          </p>
          <p>
            <FormattedMessage
              id="courseCelebration.certificateBody.notAvailable.accessCertificate"
              defaultMessage="You will be able to access your certificate any time from your
                {dashboardLink} and {profileLink}."
              values={{ dashboardLink, profileLink }}
            />
          </p>
        </>
      );
      break;
    }
    case 'requesting':
      buttonText = intl.formatMessage(messages.requestCertificateButton);
      title = intl.formatMessage(messages.certificateHeaderRequestable);
      message = (<p>{intl.formatMessage(messages.requestCertificateBodyText)}</p>);
      break;
    case 'unverified':
      buttonText = intl.formatMessage(messages.verifyIdentityButton);
      buttonLocation = verifyIdentityUrl;
      title = intl.formatMessage(messages.certificateHeaderUnverified);
      // todo: check for idVerificationSupportLink null
      message = (
        <p>
          <FormattedMessage
            id="courseCelebration.certificateBody.unverified"
            defaultMessage="In order to generate a certificate, you must complete ID verification.
              {idVerificationSupportLink} now."
            values={{ idVerificationSupportLink }}
          />
        </p>
      );
      break;
    default:
      break;
  }

  return (
    <>
      <Helmet>
        <title>{`${intl.formatMessage(messages.congratulationsHeader)} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <div className="row w-100 mx-0 mb-4 px-5 py-4 border border-light">
        <div className="col-12 p-0 h2 text-center">
          {intl.formatMessage(messages.congratulationsHeader)}
        </div>
        <div className="col-12 p-0 font-weight-normal lead text-center">
          {intl.formatMessage(messages.shareHeader)}
        </div>
        <div className="col-12 my-4 px-0 px-md-5 text-center">
          <OnMobile>
            <img
              src={CelebrationMobile}
              alt={`${intl.formatMessage(messages.congratulationsImage)}`}
              className="img-fluid"
            />
          </OnMobile>
          <OnAtLeastTablet>
            <img
              src={CelebrationDesktop}
              alt={`${intl.formatMessage(messages.congratulationsImage)}`}
              className="img-fluid"
              style={{ width: '36rem' }}
            />
          </OnAtLeastTablet>
        </div>
        <div className="col-12 px-0 px-md-5">
          <Alert variant="primary" className="row w-100 m-0">
            <div className="col order-1 order-md-0 pl-0 pr-0 pr-md-5">
              <div className="h4">{title}</div>
              {message}
              {/* The requesting status needs a different button because it does a POST instead of a GET */}
              {certStatus === 'requesting' && (
                <Button
                  className="bg-white"
                  variant="outline-primary"
                  onClick={() => dispatch(requestCert(courseId))}
                >
                  {buttonText}
                </Button>
              )}
              {certStatus === 'downloadable' && linkedinAddToProfileUrl && (
                <Button
                  className="mr-3 mb-2 mb-sm-0"
                  href={linkedinAddToProfileUrl}
                  onClick={() => logClick('linkedin')}
                  style={{ backgroundColor: LINKEDIN_BLUE, padding: '0.25rem 1.25rem 0.25rem 0.5rem' }}
                >
                  <LinkedinIcon bgStyle={{ fill: 'white' }} className="mr-2" iconFillColor={LINKEDIN_BLUE} round size={28} />
                  {`${intl.formatMessage(messages.linkedinAddToProfileButton)}`}
                </Button>
              )}
              {buttonLocation && (
                <Button
                  className="bg-white mb-2 mb-sm-0"
                  variant="outline-primary"
                  href={buttonLocation}
                >
                  {buttonText}
                </Button>
              )}
            </div>
            {certStatus !== 'unverified' && (
              <div className="col-12 order-0 col-md-3 order-md-1 w-100 mb-3 p-0 text-center">
                <img
                  src={certificate}
                  alt={`${intl.formatMessage(messages.certificateImage)}`}
                  className="w-100"
                  style={{ maxWidth: '13rem' }}
                />
              </div>
            )}
          </Alert>
          <DashboardFootnote />
        </div>
      </div>
    </>
  );
}

CourseCelebration.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseCelebration);
