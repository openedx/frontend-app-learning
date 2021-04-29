import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  } = useModel('courseHomeMeta', courseId);

  const {
    certificateData,
    hasScheduledContent,
    userHasPassingGrade,
  } = useModel('progress', courseId);

  const mode = getCourseExitMode(
    certificateData,
    hasScheduledContent,
    isEnrolled,
    userHasPassingGrade,
  );
  const dispatch = useDispatch();

  const {
    end,
    verificationData,
    certificateData: {
      certStatus,
      certWebViewUrl,
      downloadUrl,
    },
    verifiedMode,
  } = useModel('progress', courseId);

  let certCase;
  let body;
  let buttonAction;
  let buttonLocation;
  let buttonText;
  let endDate;

  const dashboardLink = <DashboardLink />;
  const idVerificationSupportLink = <IdVerificationSupportLink />;
  const profileLink = <ProfileLink />;

  if (mode === COURSE_EXIT_MODES.nonPassing) {
    certCase = 'notPassing';
    body = intl.formatMessage(messages[`${certCase}Body`]);
  } else if (mode === COURSE_EXIT_MODES.inProgress) {
    certCase = 'inProgress';
    body = intl.formatMessage(messages[`${certCase}Body`]);
  } else if (mode === COURSE_EXIT_MODES.celebration) {
    switch (certStatus) {
      case 'requesting':
        // Requestable
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
              Showcase your accomplishment on LinkedIn or your resume today.
              You can download your certificate now and access it any time from your
              {dashboardLink} and {profileLink}."
            values={{ dashboardLink, profileLink }}
          />
        );

        if (certWebViewUrl) {
          buttonLocation = `${getConfig().LMS_BASE_URL}${certWebViewUrl}`;
          buttonText = intl.formatMessage(messages.viewableButton);
        } else if (downloadUrl) {
          buttonLocation = downloadUrl;
          buttonText = intl.formatMessage(messages.downloadableButton);
        }
        break;

      case 'earned_but_not_available':
        certCase = 'notAvailable';
        endDate = <FormattedDate value={end} day="numeric" month="long" year="numeric" />;
        body = (
          <FormattedMessage
            id="courseCelebration.certificateBody.notAvailable.endDate"
            defaultMessage="Your certificate will be available soon! After this course officially ends on {endDate}, you will receive an
              email notification with your certificate."
            values={{ endDate }}
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
        }
        break;

      // This code shouldn't be hit but coding defensively since switch expects a default statement
      default:
        certCase = null;
        break;
    }
  }

  if (!certCase) {
    return null;
  }

  const header = intl.formatMessage(messages[`${certCase}Header`]);

  return (
    <section data-testid="certificate-status-component" className="text-dark-700 mb-4">
      <Card className="bg-light-200 shadow-sm">
        <Card.Body>
          <Card.Title><h3>{header}</h3></Card.Title>
          <Card.Text>
            {body}
          </Card.Text>
          {buttonText && (buttonLocation || buttonAction) && (
            <Button variant="outline-brand" onClick={buttonAction} href={buttonLocation} block>{buttonText}</Button>
          )}
        </Card.Body>
      </Card>
    </section>
  );
}

CertificateStatus.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CertificateStatus);
