import { useParams } from 'react-router-dom';

import CourseAccessErrorPage from '@src/generic/CourseAccessErrorPage';
import { CourseParamsProvider } from '@src/generic/course-params';
import { UserMessagesProvider } from '@src/generic/user-messages';

// The access-denied route's page. Not a tab, but its components share the tabs' code, which reads the params context,
// and its alert goes through the user messages it mounts.
const AccessDeniedPage = () => {
  const { courseId } = useParams() as { courseId: string };
  return (
    <UserMessagesProvider>
      <CourseParamsProvider courseId={courseId}>
        <CourseAccessErrorPage />
      </CourseParamsProvider>
    </UserMessagesProvider>
  );
};

export default AccessDeniedPage;
