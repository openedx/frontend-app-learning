import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import camelCase from 'lodash.camelcase';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';

import messages from '../messages';
import { getProctoringInfoData } from '../../data/api';
import { fetchProctoringInfoResolved } from '../../data/slice';
import { useModel } from '../../../generic/model-store';

const ProctoringInfoPanel = ({ intl }) => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    username,
  } = useModel('courseHomeMeta', courseId);
  const dispatch = useDispatch();

  const [link, setLink] = useState('');
  const [onboardingPastDue, setOnboardingPastDue] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [status, setStatus] = useState('');
  const [readableStatus, setReadableStatus] = useState('');
  const [releaseDate, setReleaseDate] = useState(null);

  const readableStatuses = {
    notStarted: 'notStarted',
    started: 'started',
    submitted: 'submitted',
    verified: 'verified',
    rejected: 'rejected',
    error: 'error',
    otherCourseApproved: 'otherCourseApproved',
    expiringSoon: 'expiringSoon',
    expired: 'expired',
  };

  function getReadableStatusClass(examStatus) {
    let readableClass = '';
    if (['created', 'download_software_clicked', 'ready_to_start'].includes(examStatus) || !examStatus) {
      readableClass = readableStatuses.notStarted;
    } else if (['started', 'ready_to_submit'].includes(examStatus)) {
      readableClass = readableStatuses.started;
    } else if (['second_review_required', 'submitted'].includes(examStatus)) {
      readableClass = readableStatuses.submitted;
    } else {
      const examStatusCamelCase = camelCase(examStatus);
      if (examStatusCamelCase in readableStatuses) {
        readableClass = readableStatuses[examStatusCamelCase];
      }
    }
    return readableClass;
  }

  function isCurrentlySubmitted(examStatus) {
    const SUBMITTED_STATES = ['submitted', 'second_review_required'];
    return SUBMITTED_STATES.includes(examStatus);
  }

  function isSubmissionRequired(examStatus) {
    const OK_STATES = [readableStatuses.submitted, readableStatuses.verified];
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
    if ([readableStatuses.submitted, readableStatuses.expiringSoon].includes(readableStatus)) {
      borderClass = 'proctoring-onboarding-submitted';
    } else if ([readableStatuses.verified, readableStatuses.otherCourseApproved].includes(readableStatus)) {
      borderClass = 'proctoring-onboarding-success';
    }
    return borderClass;
  }

  function isExpired(dateString) {
    // Returns true if the expiration date has passed
    const today = new Date();
    const expirationDateObject = new Date(dateString);
    return today >= expirationDateObject.getTime();
  }

  function isExpiringSoon(dateString) {
    // Returns true if the expiration date is within 28 days
    const twentyeightDays = 28 * 24 * 60 * 60 * 1000;
    const today = new Date();
    const expirationDateObject = new Date(dateString);
    return today > expirationDateObject.getTime() - twentyeightDays;
  }

  useEffect(() => {
    getProctoringInfoData(courseId, username)
      .then(
        response => {
          if (response) {
            if (Object.keys(response).length > 0) {
              setShowInfoPanel(true);
            }

            setStatus(response.onboarding_status);
            setLink(response.onboarding_link);
            const expirationDate = response.expiration_date;
            if (expirationDate && isExpired(expirationDate)) {
              setReadableStatus(getReadableStatusClass('expired'));
            } else if (expirationDate && isExpiringSoon(expirationDate)) {
              setReadableStatus(getReadableStatusClass('expiringSoon'));
            } else {
              setReadableStatus(getReadableStatusClass(response.onboarding_status));
            }
            setReleaseDate(new Date(response.onboarding_release_date));
            setOnboardingPastDue(response.onboarding_past_due);
          }
        },
      )
      .catch(() => {
        /* Do nothing. API throws 404 when class does not have proctoring */
      })
      .finally(() => {
        dispatch(fetchProctoringInfoResolved());
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (readableStatus === readableStatuses.otherCourseApproved) {
      onboardingExamButton = (
        <Button variant="primary" block href={link}>
          {intl.formatMessage(messages.proctoringOnboardingPracticeButton)}
        </Button>
      );
    } else if (readableStatus !== readableStatuses.otherCourseApproved) {
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
                  {readableStatus === readableStatuses.otherCourseApproved && intl.formatMessage(messages[`${readableStatus}ProctoringDetail`])}
                </p>
              </>
            )}
            {![readableStatuses.verified, readableStatuses.otherCourseApproved].includes(readableStatus) && (
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
            <Button variant="outline-primary" block href="https://support.edx.org/hc/en-us/sections/115004169247-Taking-Timed-and-Proctored-Exams">
              {intl.formatMessage(messages.proctoringReviewRequirementsButton)}
            </Button>
          </div>
        </section>
      )}
    </>
  );
};

ProctoringInfoPanel.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(ProctoringInfoPanel);
