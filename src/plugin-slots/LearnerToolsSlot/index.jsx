import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

export const LearnerToolsSlot = ({
  enrollmentMode = null,
  isStaff,
  courseId,
  unitId,
}) => {
  const authenticatedUser = getAuthenticatedUser();

  // Return null if user is not authenticated to avoid destructuring errors
  if (!authenticatedUser) {
    return null;
  }

  const { userId } = authenticatedUser;

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
      id="org.openedx.frontend.learning.learner_tools.v1"
      idAliases={['learner_tools_slot']}
      pluginProps={pluginContext}
    />,
    document.body,
  );
};

LearnerToolsSlot.propTypes = {
  isStaff: PropTypes.bool.isRequired,
  enrollmentMode: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
};
