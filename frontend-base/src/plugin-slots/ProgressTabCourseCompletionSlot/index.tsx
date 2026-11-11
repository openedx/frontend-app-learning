import React from 'react';
import CourseCompletion from '@src/course-home/progress-tab/course-completion/CourseCompletion';

// https://github.com/openedx/frontend-app-learning/issues/2185
const ProgressTabCourseCompletionSlot = ({
  enableProgressGraph,
}: { enableProgressGraph: boolean }) => (
  <>
    {enableProgressGraph && <CourseCompletion />}
  </>
);

export default ProgressTabCourseCompletionSlot;
