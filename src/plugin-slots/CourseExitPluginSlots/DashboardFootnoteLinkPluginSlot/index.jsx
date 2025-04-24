import PropTypes from 'prop-types';
import { Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import messages from '../../../courseware/course/course-exit/messages';
import { logClick } from '../../../courseware/course/course-exit/utils';
import { useModel } from '../../../generic/model-store';

const DashboardFootnoteLink = ({ variant, content }) => {
  const intl = useIntl();
  const { courseId } = useSelector(state => state.courseware);
  const { org } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();
  const { destination } = content;
  return (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={destination}
      className="text-reset"
      onClick={() => logClick(org, courseId, administrator, 'dashboard_footnote', { variant })}
    >
      {intl.formatMessage(messages.dashboardLink)}
    </Hyperlink>
  );
};

DashboardFootnoteLink.propTypes = {
  variant: PropTypes.string.isRequired,
  content: PropTypes.shape({
    destination: PropTypes.string.isRequired,
  }).isRequired,
};

const DashboardFootnoteLinkPluginSlot = ({ variant }) => {
  const destination = `${getConfig().LMS_BASE_URL}/dashboard`;
  return (
    <PluginSlot id="org.openedx.frontend.learning.course_exit_dashboard_footnote_link.v1">
      <DashboardFootnoteLink variant={variant} content={{ destination }} />
    </PluginSlot>
  );
};

DashboardFootnoteLinkPluginSlot.propTypes = {
  variant: PropTypes.string.isRequired,
};

export default DashboardFootnoteLinkPluginSlot;
