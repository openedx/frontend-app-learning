import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import CourseRecommendations from '../../courseware/course/course-exit/CourseRecommendations';

const CourseRecommendationsSlot = ({ variant }) => (
  <PluginSlot id="course_recommendations_slot">
    <CourseRecommendations variant={variant} />
  </PluginSlot>
);

CourseRecommendationsSlot.propTypes = {
  variant: PropTypes.string.isRequired,
};

export default CourseRecommendationsSlot;
