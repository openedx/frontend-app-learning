import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import messages from '../messages';
import { getProctoringInfoData } from '../../data/api';

function ProctoringInfoPanel({ courseId, intl }) {
  const [status, setStatus] = useState('');
  const [link, setLink] = useState('');
  const [readableStatus, setReadableStatus] = useState('');

  function getReadableStatusClass(examStatus) {
    let readableClass = '';
    if (['created', 'download_software_clicked', 'ready_to_start'].includes(examStatus) || !examStatus) {
      readableClass = 'notStarted';
    } else if (['started', 'ready_to_submit'].includes(examStatus)) {
      readableClass = 'started';
    } else if (['second_review_required', 'submitted'].includes(examStatus)) {
      readableClass = 'submitted';
    } else if (['verified', 'rejected', 'error'].includes(examStatus)) {
      readableClass = examStatus;
    }
    return readableClass;
  }

  function showExamLink(examStatus) {
    const NO_SHOW_STATES = ['submitted', 'second_review_required', 'verified'];
    return !NO_SHOW_STATES.includes(examStatus);
  }

  function getBorderClass(examStatus) {
    let borderClass = '';
    if (['submitted', 'second_review_required'].includes(examStatus)) {
      borderClass = 'proctoring-onboarding-submitted';
    } else if (examStatus === 'verified') {
      borderClass = 'proctoring-onboarding-success';
    }
    return borderClass;
  }

  useEffect(() => {
    getProctoringInfoData(courseId)
      .then(
        response => {
          if (response) {
            setStatus(response.onboarding_status);
            setLink(response.onboarding_link);
            setReadableStatus(getReadableStatusClass(response.onboarding_status));
          }
        },
      );
  }, []);

  return (
    <>
      { link && (
        <section className={`mb-4 p-3 outline-sidebar-proctoring-panel ${getBorderClass(status)}`}>
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
              </>
            )}
            {(readableStatus !== 'verified') && (
              <>
                <p>{intl.formatMessage(messages.proctoringPanelGeneralInfo)}</p>
                <p>{intl.formatMessage(messages.proctoringPanelGeneralTime)}</p>
              </>
            )}
            {showExamLink(status) && (
              <Button variant="primary" block href={`${getConfig().LMS_BASE_URL}${link}`}>
                {intl.formatMessage(messages.proctoringOnboardingButton)}
              </Button>
            )}
            <Button variant="outline-primary" block href="https://support.edx.org/hc/en-us/sections/115004169247-Taking-Timed-and-Proctored-Exams">
              {intl.formatMessage(messages.proctoringReviewRequirementsButton)}
            </Button>
          </div>
        </section>
      )}
    </>
  );
}

ProctoringInfoPanel.propTypes = {
  courseId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(ProctoringInfoPanel);
