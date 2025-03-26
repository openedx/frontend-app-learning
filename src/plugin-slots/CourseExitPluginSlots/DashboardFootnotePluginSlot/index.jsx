import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import DashboardFootnote from '../../../courseware/course/course-exit/DashboardFootnote';

const DashboardFootnotePluginSlot = ({ variant }) => {
  const dashboardFootnoteUrl = `${getConfig().LMS_BASE_URL}/dashboard`;
  return (
    <PluginSlot id="course_exit_dashboard_footnote_slot">
      <DashboardFootnote
        variant={variant}
        content={{ dashboardFootnoteUrl }}
      />
    </PluginSlot>
  );
};

DashboardFootnotePluginSlot.propTypes = {
  variant: PropTypes.string.isRequired,
};
export default DashboardFootnotePluginSlot;
