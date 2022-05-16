import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import {
  FormattedDate, FormattedMessage, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';

import { Button, Card } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useModel } from '../../../generic/model-store';
import { COURSE_EXIT_MODES, getCourseExitMode } from '../../../courseware/course/course-exit/utils';
import { DashboardLink, IdVerificationSupportLink, ProfileLink } from '../../../shared/links';
import { requestCert } from '../../data/thunks';
import messages from './messages';

function CertificateStatus({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    isEnrolled,
    org,
    canViewCertificate,
    userTimezone,
  } = useModel('courseHomeMeta', courseId);

  const {
    certificateData,
    end,
    enrollmentMode,
    gradingPolicy: {
      gradeRange,
    },
    hasScheduledContent,
    userHasPassingGrade,
    verificationData,
    verifiedMode,
  } = useModel('progress', courseId);
  const {
    certificateAvailableDate,
  } = certificateData || {};

  const mode = getCourseExitMode(
    certificateData,
    hasScheduledContent,
    isEnrolled,
    userHasPassingGrade,
    null, // CourseExitPageIsActive
    canViewCertificate,
  );

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const dispatch = useDispatch();
  const { administrator } = getAuthenticatedUser();

  let certStatus;
  let certWebViewUrl;
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  if (certificateData) {
    certStatus = certificateData.certStatus;
    certWebViewUrl = certificateData.certWebViewUrl;
  }

  let certCase;
  let certEventName = certStatus;
  let body;
  let buttonAction;
  let buttonLocation;
  let buttonText;
  let endDate;
  let certAvailabilityDate;

  let gradeEventName = 'not_passing';
  if (userHasPassingGrade) {
    gradeEventName = Object.entries(gradeRange).length > 1 ? 'passing_grades' : 'passing';
  }

  const dashboardLink = <DashboardLink />;
  const idVerificationSupportLink = <IdVerificationSupportLink />;
  const profileLink = <ProfileLink />;

  // Some learners have a valid ("downloadable") certificate without being in a passing
  // state (e.g. learners who have been added to a course's allowlist), so we need to
  // skip grade validation for these learners
  const certIsDownloadable = certStatus === 'downloadable';
  if (mode === COURSE_EXIT_MODES.disabled) {
    certEventName = 'certificate_status_disabled';
  } else if (mode === COURSE_EXIT_MODES.nonPassing && !certIsDownloadable) {
    certCase = 'notPassing';
    certEventName = 'not_passing';
    body = intl.formatMessage(messages[`${certCase}Body`]);
  } else if (mode === COURSE_EXIT_MODES.inProgress && !certIsDownloadable) {
    certCase = 'inProgress';
    certEventName = 'has_scheduled_content';
    body = intl.formatMessage(messages[`${certCase}Body`]);
  } else if (mode === COURSE_EXIT_MODES.celebration || certIsDownloadable) {
    switch (certStatus) {
      case 'requesting':
        certCase = 'requestable';
        buttonAction = () => { dispatch(requestCert(courseId)); };
        body = intl.formatMessage(messages[`${certCase}Body`]);
        buttonText = intl.formatMessage(messages[`${certCase}Button`]);
        break;

      case 'unverified':
        certCase = 'unverified';
        if (verificationData.status === 'pending') {
          body = (<p>{intl.formatMessage(messages.unverifiedPendingBody)}</p>);
        } else {
          body = (
            <FormattedMessage
              id="progress.certificateStatus.unverifiedBody"
              defaultMessage="In order to generate a certificate, you must complete ID verification. {idVerificationSupportLink}."
              description="Its shown when learner are not verified thus it recommends going over the verification process"
              values={{ idVerificationSupportLink }}
            />
          );
          buttonLocation = verificationData.link;
          buttonText = intl.formatMessage(messages[`${certCase}Button`]);
        }
        break;

      case 'downloadable':
        // Certificate available, download/viewable
        certCase = 'downloadable';
        body = (
          <FormattedMessage
            id="progress.certificateStatus.downloadableBody"
            defaultMessage="
              Showcase your accomplishment on LinkedIn or your resumé today.
              You can download your certificate now and access it any time from your
              {dashboardLink} and {profileLink}."
            description="Recommending an action for learner when course certificate is available"
            values={{ dashboardLink, profileLink }}
          />
        );
        if (certWebViewUrl) {
          certEventName = 'earned_viewable';
          buttonLocation = `${getConfig().LMS_BASE_URL}${certWebViewUrl}`;
          buttonText = intl.formatMessage(messages.viewableButton);
        }
        break;

      case 'earned_but_not_available':
        certCase = 'notAvailable';
        endDate = <FormattedDate value={end} day="numeric" month="long" year="numeric" />;
        certAvailabilityDate = <FormattedDate value={certificateAvailableDate} day="numeric" month="long" year="numeric" />;
        body = (
          <FormattedMessage
            id="courseCelebration.certificateBody.notAvailable.endDate"
            defaultMessage="This course ends on {endDate}. Final grades and any earned certificates are
            scheduled to be available after {certAvailabilityDate}."
            description="This shown for leaner when they are eligible for certifcate but it't not available yet, it could because leaners just finished the course quickly!"
            values={{ endDate, certAvailabilityDate }}
          />
        );
        break;

      case 'audit_passing':
      case 'honor_passing':
        if (verifiedMode) {
          certCase = 'upgrade';
          body = intl.formatMessage(messages[`${certCase}Body`]);
          buttonLocation = verifiedMode.upgradeUrl;
          buttonText = intl.formatMessage(messages[`${certCase}Button`]);
        } else {
          certCase = null; // Do not render the certificate component if the upgrade deadline has passed
          certEventName = 'audit_passing_missed_upgrade_deadline';
        }
        break;

      default:
        // if user completes a course before certificates are available, treat it as notAvailable
        // regardless of passing or nonpassing status
        if (!canViewCertificate) {
          certCase = 'notAvailable';
          endDate = intl.formatDate(end, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...timezoneFormatArgs,
          });
          body = intl.formatMessage(messages.notAvailableEndDateBody, { endDate });
        } else {
          certCase = null;
          certEventName = 'no_certificate_status';
        }
        break;
    }
  }

  // Log visit to progress tab
  useEffect(() => {
    sendTrackEvent('edx.ui.lms.course_progress.visited', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
      track_variant: enrollmentMode,
      grade_variant: gradeEventName,
      certificate_status_variant: certEventName,
    });
  }, []);

  if (!certCase) {
    return null;
  }

  const header = intl.formatMessage(messages[`${certCase}Header`]);

  const logCertificateStatusButtonClicked = () => {
    sendTrackEvent('edx.ui.lms.course_progress.certificate_status.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
      certificate_status_variant: certEventName,
    });
    if (certCase === 'upgrade') {
      sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
        ...eventProperties,
        linkCategory: '(none)',
        linkName: 'progress_certificate',
        linkType: 'button',
        pageName: 'progress',
      });
    }
  };

  return (
    <section data-testid="certificate-status-component" className="text-dark-700 mb-4">
      <Card className="bg-light-200 raised-card">
        <Card.Header title={header} />
        <Card.Section className="small text-gray-700">
          {body}
        </Card.Section>
        <Card.Footer>
          {buttonText && (buttonLocation || buttonAction) && (
            <Button
              variant="outline-brand"
              onClick={() => {
                logCertificateStatusButtonClicked(certStatus);
                if (buttonAction) { buttonAction(); }
              }}
              href={buttonLocation}
              block
            >
              {buttonText}
            </Button>
          )}
        </Card.Footer>
      </Card>
    </section>
  );
}

CertificateStatus.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CertificateStatus);
