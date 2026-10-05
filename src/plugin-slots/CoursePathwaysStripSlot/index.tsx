import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { CoursePathwaysStrip } from '@src/course-pathways/CoursePathwaysStrip';

interface CoursePathwaysStripSlotProps {
  courseId?: string;
}

export const CoursePathwaysStripSlot = ({ courseId }: CoursePathwaysStripSlotProps) => {
  if (!getConfig().ENABLE_PATHWAY_PILOT_UI) {
    return null;
  }

  return (
    <PluginSlot
      id="org.openedx.frontend.learning.course_pathways_strip.v1"
      pluginProps={{ courseId }}
    >
      <CoursePathwaysStrip courseId={courseId} />
    </PluginSlot>
  );
};
