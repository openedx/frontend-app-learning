import { useParams } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';
import { getExternalLinkUrl } from '@edx/frontend-platform';
import { Button } from '@openedx/paragon';

import messages from '../messages';
import { useProctoringInfoData } from '../../data/apiHooks';
import { getReadableProctoringStatus, readableProctoringStatuses } from '../utils';
import { useModel } from '../../../generic/model-store';

const ProctoringInfoPanel = () => {
  const intl = useIntl();
  const { courseId } = useParams();
  const {
    username,
  } = useModel('courseHomeMeta', courseId);
  const { data: proctoringInfo } = useProctoringInfoData(courseId, username);

  const link = proctoringInfo?.onboarding_link;
  const onboardingPastDue = proctoringInfo?.onboarding_past_due;
  const showInfoPanel = !!proctoringInfo && Object.keys(proctoringInfo).length > 0;
  const status = proctoringInfo?.onboarding_status;
  const readableStatus = proctoringInfo ? getReadableProctoringStatus(proctoringInfo) : '';
  const releaseDate = proctoringInfo ? new Date(proctoringInfo.onboarding_release_date) : null;

  function isCurrentlySubmitted(examStatus) {
    const SUBMITTED_STATES = ['submitted', 'second_review_required'];
    return SUBMITTED_STATES.includes(examStatus);
  }

  function isSubmissionRequired(examStatus) {
    const OK_STATES = [readableProctoringStatuses.submitted, readableProctoringStatuses.verified];
    return !OK_STATES.includes(examStatus);
  }

  function isNotYetReleased(examReleaseDate) {
    if (!examReleaseDate) {
      return false;
    }
    const now = new Date();
    return now < examReleaseDate;
  }

  function getBorderClass() {
    let borderClass = '';
    if ([readableProctoringStatuses.submitted, readableProctoringStatuses.expiringSoon].includes(readableStatus)) {
      borderClass = 'proctoring-onboarding-submitted';
    } else if (
      [readableProctoringStatuses.verified, readableProctoringStatuses.otherCourseApproved].includes(readableStatus)
    ) {
      borderClass = 'proctoring-onboarding-success';
    }
    return borderClass;
  }

  let onboardingExamButton = null;

  if (isNotYetReleased(releaseDate)) {
    onboardingExamButton = (
      <Button variant="secondary" block disabled aria-disabled="true">
        {intl.formatMessage(
          messages.proctoringOnboardingButtonNotOpen,
          {
            releaseDate: intl.formatDate(releaseDate, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
          },
        )}
      </Button>
    );
  } else if (onboardingPastDue) {
    onboardingExamButton = (
      <Button variant="secondary" block disabled aria-disabled="true">
        {intl.formatMessage(messages.proctoringOnboardingButtonPastDue)}
      </Button>
    );
  } else if (!isNotYetReleased(releaseDate)) {
    if (readableStatus === readableProctoringStatuses.otherCourseApproved) {
      onboardingExamButton = (
        <Button variant="primary" block href={link}>
          {intl.formatMessage(messages.proctoringOnboardingPracticeButton)}
        </Button>
      );
    } else if (readableStatus !== readableProctoringStatuses.otherCourseApproved) {
      onboardingExamButton = (
        <Button variant="primary" block href={link}>
          {intl.formatMessage(messages.proctoringOnboardingButton)}
        </Button>
      );
    }
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      { showInfoPanel && (
        <section className={`mb-4 p-3 outline-sidebar-proctoring-panel ${getBorderClass()}`}>
          <h2 className="h4" id="outline-sidebar-upgrade-header">{intl.formatMessage(messages.proctoringInfoPanel)}</h2>
          <div>
            {readableStatus && (
              <>
                <p className="h6">
                  {intl.formatMessage(messages.proctoringCurrentStatus)} {intl.formatMessage(messages[`${readableStatus}ProctoringStatus`])}
                </p>
                <p>
                  {intl.formatMessage(messages[`${readableStatus}ProctoringMessage`])}
                </p>
                <p>
                  {readableStatus === readableProctoringStatuses.otherCourseApproved && intl.formatMessage(messages[`${readableStatus}ProctoringDetail`])}
                </p>
              </>
            )}
            {![readableProctoringStatuses.verified, readableProctoringStatuses.otherCourseApproved]
              .includes(readableStatus) && (
              <>
                <p>
                  {!isCurrentlySubmitted(status) && (
                    intl.formatMessage(messages.proctoringPanelGeneralInfo)
                  )}
                  {isCurrentlySubmitted(status) && (
                    intl.formatMessage(messages.proctoringPanelGeneralInfoSubmitted)
                  )}
                </p>
                <p>{intl.formatMessage(messages.proctoringPanelGeneralTime)}</p>
              </>
            )}
            {isSubmissionRequired(readableStatus) && (
              onboardingExamButton
            )}
            <Button variant="outline-primary" block href={getExternalLinkUrl('https://support.edx.org/hc/en-us/sections/115004169247-Taking-Timed-and-Proctored-Exams')}>
              {intl.formatMessage(messages.proctoringReviewRequirementsButton)}
            </Button>
          </div>
        </section>
      )}
    </>
  );
};

export default ProctoringInfoPanel;
