import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import { Xpert } from '@edx/frontend-lib-learning-assistant';
import { injectIntl } from '@edx/frontend-platform/i18n';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';

const Chat = ({
  enabled,
  enrollmentMode,
  isStaff,
  courseId,
  contentToolsEnabled,
}) => {
  const VERIFIED_MODES = [
    'professional',
    'verified',
    'no-id-professional',
    'credit',
    'masters',
    'executive-education',
    'paid-executive-education',
    'paid-bootcamp',
  ];

  const AUDIT_MODES = [
    'audit',
    'honor',
    'unpaid-executive-education',
    'unpaid-bootcamp',
  ];

  const isEnrolled = (
    enrollmentMode !== null
    && enrollmentMode !== undefined
    && [...VERIFIED_MODES, ...AUDIT_MODES].some(mode => mode === enrollmentMode)
  );

  const shouldDisplayChat = (
    enabled
    && (isEnrolled || isStaff) // display only to enrolled or staff
  );

  // TODO: Remove this Segment alert. This has been added purely to diagnose whether
  //       usage issues are as a result of the Xpert toggle button not appearing.
  if (shouldDisplayChat) {
    sendTrackEvent('edx.ui.lms.learning_assistant.render', {
      course_id: courseId,
    });
  }

  return (
    <>
      {/* Use a portal to ensure that component overlay does not compete with learning MFE styles. */}
      {shouldDisplayChat && (createPortal(
        <Xpert courseId={courseId} contentToolsEnabled={contentToolsEnabled} />,
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
};

Chat.defaultProps = {
  enrollmentMode: null,
};

export default injectIntl(Chat);
