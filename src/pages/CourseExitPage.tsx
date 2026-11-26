import { useParams } from 'react-router-dom';

import { CourseExit } from '@src/courseware/course/course-exit';
import { CourseParamsProvider } from '@src/generic/course-params';
import LearningWidgetProviders from '@src/generic/LearningWidgetProviders';
import CourseTabPage from './CourseTabPage';

/*
 * The course exit route's page. Not a tab, but it renders in the tab frame as the courseware does (with the
 * courseware's title, redirect and tours, and the providers the frame needs), and its components share the tabs'
 * code, which reads the params context.
 */
const CourseExitPage = () => {
  const { courseId } = useParams() as { courseId: string };
  return (
    <CourseTabPage courseId={courseId} tabSlug="courseware">
      <LearningWidgetProviders>
        <CourseParamsProvider courseId={courseId}>
          <CourseExit />
        </CourseParamsProvider>
      </LearningWidgetProviders>
    </CourseTabPage>
  );
};

export default CourseExitPage;
