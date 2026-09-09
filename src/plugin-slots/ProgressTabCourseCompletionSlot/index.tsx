import { PluginSlot } from '@openedx/frontend-plugin-framework';
import React from 'react';
import CourseCompletion from '@src/course-home/progress-tab/course-completion/CourseCompletion';

const ProgressTabCourseCompletionSlot = ({
  enableProgressGraph,
}: { enableProgressGraph: boolean }) => (
  <PluginSlot
    id="org.openedx.frontend.learning.progress_tab_course_completion.v1"
    pluginProps={{ enableProgressGraph }}
  >
    {enableProgressGraph && <CourseCompletion />}
  </PluginSlot>
);

export default ProgressTabCourseCompletionSlot;
