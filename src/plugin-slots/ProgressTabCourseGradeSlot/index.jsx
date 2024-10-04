import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import CourseGrade from '../../course-home/progress-tab/grades/course-grade/CourseGrade';

const ProgressTabCourseGradeSlot = ({ courseId }) => (
  <PluginSlot
    id="progress_tab_course_grade_slot"
    pluginProps={{
      courseId,
    }}
  >
    <CourseGrade />
  </PluginSlot>
);

ProgressTabCourseGradeSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default ProgressTabCourseGradeSlot;
