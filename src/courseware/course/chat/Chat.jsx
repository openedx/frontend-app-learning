import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { Xpert } from '@edx/frontend-lib-learning-assistant';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';

import { AUDIT_MODES, VERIFIED_MODES } from '@src/constants';
import { useModel } from '../../../generic/model-store';

const Chat = ({
  enabled,
  enrollmentMode,
  isStaff,
  courseId,
  contentToolsEnabled,
  unitId,
}) => {
  const {
    activeAttempt, exam,
  } = useSelector(state => state.specialExams);
  const course = useModel('coursewareMeta', courseId);

  const hasValidEnrollment = (
    enrollmentMode !== null
    && enrollmentMode !== undefined
    && (
      VERIFIED_MODES.includes(enrollmentMode)
      // audit learners are only eligible if Xpert has been explicitly enabled for audit
      || (AUDIT_MODES.includes(enrollmentMode) && getConfig().ENABLE_XPERT_AUDIT)
    )
  );

  const validDates = () => {
    const date = new Date();
    const utcDate = date.toISOString();

    const startDate = course.start || utcDate;
    const endDate = course.end || utcDate;

    return (
      startDate <= utcDate
      && utcDate <= endDate
    );
  };

  const shouldDisplayChat = (
    enabled
    && (hasValidEnrollment || isStaff)
    && validDates()
    // it is necessary to check both whether the user is in an exam, and whether or not they are viewing an exam
    // this will prevent the learner from interacting with the tool at any point of the exam flow, even at the
    // entrance interstitial.
    && !(activeAttempt?.attempt_id || exam?.id)
  );

  const isUpgradeEligible = (
    enrollmentMode !== null
    && enrollmentMode !== undefined
    && AUDIT_MODES.includes(enrollmentMode)
  );

  return (
    <>
      {/* Use a portal to ensure that component overlay does not compete with learning MFE styles. */}
      {shouldDisplayChat && (createPortal(
        <Xpert
          courseId={courseId}
          contentToolsEnabled={contentToolsEnabled}
          unitId={unitId}
          isUpgradEligible={isUpgradeEligible}
        />,
        document.body,
      ))}
    </>
  );
};

Chat.propTypes = {
  isStaff: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
  enrollmentMode: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  contentToolsEnabled: PropTypes.bool.isRequired,
  unitId: PropTypes.string.isRequired,
};

Chat.defaultProps = {
  enrollmentMode: null,
};

export default injectIntl(Chat);
