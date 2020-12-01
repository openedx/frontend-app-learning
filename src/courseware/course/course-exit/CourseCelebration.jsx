import React, { useEffect } from 'react';

import {
  FormattedDate, FormattedMessage, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';
import { layoutGenerator } from 'react-break';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { LinkedinIcon } from 'react-share';
import { Alert, Button, Hyperlink } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import CelebrationMobile from './assets/celebration_456x328.gif';
import CelebrationDesktop from './assets/celebration_750x540.gif';
import certificate from '../../../generic/assets/edX_verified_certificate.png';
import certificateLocked from '../../../generic/assets/edX_locked_verified_certificate.png';
import messages from './messages';
import { useModel } from '../../../generic/model-store';
import { requestCert } from '../../../course-home/data/thunks';
import ProgramCompletion from './ProgramCompletion';
import DashboardFootnote from './DashboardFootnote';
import UpgradeFootnote from './UpgradeFootnote';
import SocialIcons from '../../social-share/SocialIcons';
import { logClick, logVisit } from './utils';

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
    org,
    relatedPrograms,
    verifiedMode,
    verifyIdentityUrl,
  } = useModel('courses', courseId);

  const {
    certStatus,
    certWebViewUrl,
    downloadUrl,
  } = certificateData || {};

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
  const idVerificationSupportLink = getConfig().SUPPORT_URL_ID_VERIFICATION && (
    <Hyperlink
      className="text-gray-700"
      style={{ textDecoration: 'underline' }}
      destination={getConfig().SUPPORT_URL_ID_VERIFICATION}
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

  let buttonLocation;
  let buttonText;
  let buttonBackground = 'bg-white';
  let buttonVariant = 'outline-primary';
  let buttonEvent = null;
  let certificateImage = certificate;
  let footnote;
  let message;
  let certHeader;
  let visitEvent = 'celebration_generic';
  // These cases are taken from the edx-platform `get_cert_data` function found in lms/courseware/views/views.py
  switch (certStatus) {
    case 'downloadable':
      certHeader = intl.formatMessage(messages.certificateHeaderDownloadable);
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
      buttonEvent = 'view_cert';
      visitEvent = 'celebration_with_cert';
      footnote = <DashboardFootnote />;
      break;
    case 'earned_but_not_available': {
      const endDate = <FormattedDate value={end} day="numeric" month="long" year="numeric" />;
      certHeader = intl.formatMessage(messages.certificateHeaderNotAvailable);
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
      visitEvent = 'celebration_with_unavailable_cert';
      footnote = <DashboardFootnote />;
      break;
    }
    case 'requesting':
      buttonText = intl.formatMessage(messages.requestCertificateButton);
      buttonEvent = 'request_cert';
      certHeader = intl.formatMessage(messages.certificateHeaderRequestable);
      message = (<p>{intl.formatMessage(messages.requestCertificateBodyText)}</p>);
      visitEvent = 'celebration_with_requestable_cert';
      footnote = <DashboardFootnote />;
      break;
    case 'unverified':
      buttonText = intl.formatMessage(messages.verifyIdentityButton);
      buttonEvent = 'verify_id';
      buttonLocation = verifyIdentityUrl;
      certHeader = intl.formatMessage(messages.certificateHeaderUnverified);
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
      visitEvent = 'celebration_unverified';
      footnote = <DashboardFootnote />;
      break;
    case 'audit_passing':
    case 'honor_passing':
      if (verifiedMode) {
        certHeader = intl.formatMessage(messages.certificateHeaderUpgradable);
        message = (
          <p>
            <FormattedMessage
              id="courseCelebration.certificateBody.upgradable"
              defaultMessage="It’s not too late to upgrade. For {price} you will unlock access to all graded
                assignments in this course. Upon completion, you will receive a verified certificate which is a
                valuable credential to improve your job prospects and advance your career, or highlight your
                certificate in school applications."
              values={{ price: verifiedMode.currencySymbol + verifiedMode.price }}
            />
            <br />
            {getConfig().SUPPORT_URL_VERIFIED_CERTIFICATE && (
              <Hyperlink
                className="text-gray-700"
                style={{ textDecoration: 'underline' }}
                destination={getConfig().SUPPORT_URL_VERIFIED_CERTIFICATE}
              >
                {intl.formatMessage(messages.verifiedCertificateSupportLink)}
              </Hyperlink>
            )}
          </p>
        );
        buttonText = intl.formatMessage(messages.upgradeButton);
        buttonEvent = 'upgrade';
        buttonLocation = verifiedMode.upgradeUrl;
        buttonBackground = '';
        buttonVariant = 'primary';
        certificateImage = certificateLocked;
        visitEvent = 'celebration_upgrade';
        if (verifiedMode.accessExpirationDate) {
          footnote = <UpgradeFootnote deadline={verifiedMode.accessExpirationDate} href={verifiedMode.upgradeUrl} />;
        } else {
          footnote = <DashboardFootnote />;
        }
      }
      break;
    default:
      break;
  }

  useEffect(() => logVisit(org, courseId, administrator, visitEvent), [org, courseId, administrator, visitEvent]);

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
          <SocialIcons
            analyticsId="edx.ui.lms.course_exit.social_share.clicked"
            className="mt-2"
            courseId={courseId}
            emailSubject={messages.socialMessage}
            socialMessage={messages.socialMessage}
          />
        </div>
        <div className="col-12 mt-3 mb-4 px-0 px-md-5 text-center">
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
          {certHeader && (
          <Alert variant="primary" className="row w-100 m-0">
            <div className="col order-1 order-md-0 pl-0 pr-0 pr-md-5">
              <div className="h4">{certHeader}</div>
              {message}
              {/* The requesting status needs a different button because it does a POST instead of a GET */}
              {certStatus === 'requesting' && (
                <Button
                  className={buttonBackground}
                  variant={buttonVariant}
                  onClick={() => {
                    logClick(courseId, administrator, buttonEvent);
                    dispatch(requestCert(courseId));
                  }}
                >
                  {buttonText}
                </Button>
              )}
              {certStatus === 'downloadable' && linkedinAddToProfileUrl && (
                <Button
                  className="mr-3 mb-2 mb-sm-0"
                  href={linkedinAddToProfileUrl}
                  onClick={() => logClick(courseId, administrator, 'linkedin_add_to_profile')}
                  style={{ backgroundColor: LINKEDIN_BLUE, padding: '0.25rem 1.25rem 0.25rem 0.5rem' }}
                >
                  <LinkedinIcon bgStyle={{ fill: 'white' }} className="mr-2" iconFillColor={LINKEDIN_BLUE} round size={28} />
                  {`${intl.formatMessage(messages.linkedinAddToProfileButton)}`}
                </Button>
              )}
              {buttonLocation && (
                <Button
                  className={`${buttonBackground} mb-2 mb-sm-0`}
                  variant={buttonVariant}
                  href={buttonLocation}
                  onClick={() => logClick(courseId, administrator, buttonEvent)}
                >
                  {buttonText}
                </Button>
              )}
            </div>
            {certStatus !== 'unverified' && (
              <div className="col-12 order-0 col-md-3 order-md-1 w-100 mb-3 p-0 text-center">
                <img
                  src={certificateImage}
                  alt={`${intl.formatMessage(messages.certificateImage)}`}
                  className="w-100"
                  style={{ maxWidth: '13rem' }}
                />
              </div>
            )}
          </Alert>
          )}
          {relatedPrograms && relatedPrograms.map(program => (
            <ProgramCompletion
              key={program.uuid}
              progress={program.progress}
              title={program.title}
              type={program.slug}
              url={program.url}
            />
          ))}
          {footnote}
        </div>
      </div>
    </>
  );
}

CourseCelebration.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseCelebration);
