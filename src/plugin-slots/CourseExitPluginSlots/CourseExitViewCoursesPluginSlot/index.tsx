import { Button } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../../courseware/course/course-exit/messages';

interface Props {
  content: { href: string }
}

const ViewCoursesLink: React.FC<Props> = ({ content }) => {
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

const CourseExitViewCoursesPluginSlot: React.FC = () => {
  const href = `${getConfig().LMS_BASE_URL}/dashboard`;
  return (
    <PluginSlot id="org.openedx.frontend.learning.course_exit_view_courses.v1">
      <ViewCoursesLink content={{ href }} />
    </PluginSlot>
  );
};

export default CourseExitViewCoursesPluginSlot;
