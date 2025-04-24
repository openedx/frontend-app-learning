import { PluginSlot } from '@openedx/frontend-plugin-framework';
import CourseRecommendations from '../../../courseware/course/course-exit/CourseRecommendations';

interface Props {
  variant: string;
}

export const CourseRecommendationsSlot: React.FC<Props> = ({ variant }: Props) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_recommendations.v1"
    idAliases={['course_recommendations_slot']}
  >
    <CourseRecommendations variant={variant} />
  </PluginSlot>
);
