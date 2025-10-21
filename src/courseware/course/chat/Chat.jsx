import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

const Chat = ({
  enabled,
  enrollmentMode,
  isStaff,
  courseId,
  unitId,
}) => {
  const { userId } = getAuthenticatedUser();

  // If chat is disabled, don't show anything
  if (!enabled) {
    return null;
  }

  // Provide minimal, generic context - no feature-specific flags
  const pluginContext = {
    courseId,
    unitId,
    userId,
    isStaff,
    enrollmentMode,
  };

  // Use generic plugin slot ID (location-based, not feature-specific)
  // Plugins will query their own requirements from Redux/config
  return createPortal(
    <PluginSlot
      id="learner_tools_slot"
      pluginProps={pluginContext}
    />,
    document.body,
  );
};

Chat.propTypes = {
  isStaff: PropTypes.bool.isRequired,
  enabled: PropTypes.bool.isRequired,
  enrollmentMode: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
};

Chat.defaultProps = {
  enrollmentMode: null,
};

export default Chat;
