import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { CoursePathwaysStrip } from '@src/pathways/pathways-strip/CoursePathwaysStrip';

interface CourseInfoStripSlotProps {
  courseId?: string;
}

export const CourseInfoStripSlot = ({ courseId }: CourseInfoStripSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_info_strip.v1"
    pluginProps={{ courseId }}
  >
    <CoursePathwaysStrip courseId={courseId} />
  </PluginSlot>
);
