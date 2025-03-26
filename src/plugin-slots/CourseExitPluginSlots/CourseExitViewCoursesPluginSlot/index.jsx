import { Button } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../../courseware/course/course-exit/messages';

const ViewCoursesLink = ({ content }) => {
  const intl = useIntl();
  return (
    <div className="row w-100 mt-2 mb-4 justify-content-end">
      <Button
        variant="outline-primary"
        href={content.href}
      >
        {intl.formatMessage(messages.viewCoursesButton)}
      </Button>
    </div>
  );
};

ViewCoursesLink.propTypes = {
  content: PropTypes.shape({
    href: PropTypes.string.isRequired,
  }).isRequired,
};

const CourseExitViewCoursesPluginSlot = () => {
  const href = `${getConfig().LMS_BASE_URL}/dashboard`;
  return (
    <PluginSlot id="course_exit_view_courses_slot">
      <ViewCoursesLink content={{ href }} />
    </PluginSlot>
  );
};

CourseExitViewCoursesPluginSlot.propTypes = {};

export default CourseExitViewCoursesPluginSlot;
