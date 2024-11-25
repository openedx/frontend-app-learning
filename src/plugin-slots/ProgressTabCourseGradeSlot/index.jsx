import { PluginSlot } from '@openedx/frontend-plugin-framework';
import CourseGrade from '../../course-home/progress-tab/grades/course-grade/CourseGrade';

const ProgressTabCourseGradeSlot = () => (
  <PluginSlot
    id="progress_tab_course_grade_slot"
  >
    <CourseGrade />
  </PluginSlot>
);

ProgressTabCourseGradeSlot.propTypes = {};

export default ProgressTabCourseGradeSlot;
