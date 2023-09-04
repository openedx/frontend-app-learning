import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import { Xpert } from '@edx/frontend-lib-learning-assistant';
import { injectIntl } from '@edx/frontend-platform/i18n';

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
  ];

  const isVerifiedEnrollmentMode = (
    enrollmentMode !== null
    && enrollmentMode !== undefined
    && VERIFIED_MODES.some(mode => mode === enrollmentMode)
  );

  const shouldDisplayChat = (
    enabled
    && (isVerifiedEnrollmentMode || isStaff) // display only to non-audit or staff
  );

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
