import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { Xpert } from '@edx/frontend-lib-learning-assistant';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl } from '@edx/frontend-platform/i18n';

import { ALLOW_UPSELL_MODES, VERIFIED_MODES } from '@src/constants';
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

  // If is disabled or taking an exam, we don't show the chat.
  if (!enabled || activeAttempt?.attempt_id || exam?.id) { return null; }

  // If is not staff and doesn't have an enrollment, we don't show the chat.
  if (!isStaff && !enrollmentMode) { return null; }

  const verifiedMode = VERIFIED_MODES.includes(enrollmentMode); // Enrollment verified
  const auditMode = (
    !isStaff
    && !verifiedMode
    && ALLOW_UPSELL_MODES.includes(enrollmentMode) // Can upgrade course
    && getConfig().ENABLE_XPERT_AUDIT
  );
  // If user has no access, we don't show the chat.
  if (!isStaff && !(verifiedMode || auditMode)) { return null; }

  // Date validation
  const {
    accessExpiration,
    start,
    end,
  } = course;

  const utcDate = (new Date()).toISOString();
  const expiration = accessExpiration?.expirationDate || utcDate;
  const validDate = (
    (start ? start <= utcDate : true)
    && (end ? end >= utcDate : true)
    && (auditMode ? expiration >= utcDate : true)
  );
  // If date is invalid, we don't show the chat.
  if (!validDate) { return null; }

  // Use a portal to ensure that component overlay does not compete with learning MFE styles.
  return createPortal(
    <Xpert
      courseId={courseId}
      contentToolsEnabled={contentToolsEnabled}
      unitId={unitId}
      isUpgradeEligible={auditMode}
    />,
    document.body,
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
