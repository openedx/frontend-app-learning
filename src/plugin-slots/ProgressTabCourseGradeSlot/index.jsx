import { PluginSlot } from '@openedx/frontend-plugin-framework';
import CourseGrade from '../../course-home/progress-tab/grades/course-grade/CourseGrade';

const ProgressTabCourseGradeSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.learning.progress_tab_course_grade.v1"
    idAliases={['progress_tab_course_grade_slot']}
  >
    <CourseGrade />
  </PluginSlot>
);

ProgressTabCourseGradeSlot.propTypes = {};

export default ProgressTabCourseGradeSlot;
