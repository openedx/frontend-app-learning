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
  unitId,
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

  return (
    <>
      {/* Use a portal to ensure that component overlay does not compete with learning MFE styles. */}
      {shouldDisplayChat && (createPortal(
        <Xpert courseId={courseId} contentToolsEnabled={contentToolsEnabled} unitId={unitId} />,
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
