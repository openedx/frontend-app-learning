import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import DetailedGrades from '../../course-home/progress-tab/grades/detailed-grades/DetailedGrades';

const ProgressTabDetailedGradesSlot = ({ courseId }) => (
  <PluginSlot
    id="progress_tab_detailed_grades_slot"
    pluginProps={{
      courseId,
    }}
  >
    <DetailedGrades />
  </PluginSlot>
);

ProgressTabDetailedGradesSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default ProgressTabDetailedGradesSlot;
