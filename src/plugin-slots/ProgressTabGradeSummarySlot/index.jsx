import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import GradeSummary from '../../course-home/progress-tab/grades/grade-summary/GradeSummary';

const ProgressTabGradeSummarySlot = ({ courseId }) => (
  <PluginSlot
    id="progress_tab_grade_summary_slot"
    pluginProps={{
      courseId,
    }}
  >
    <GradeSummary />
  </PluginSlot>
);

ProgressTabGradeSummarySlot.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default ProgressTabGradeSummarySlot;
