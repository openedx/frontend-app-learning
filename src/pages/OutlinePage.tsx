import { useParams } from 'react-router-dom';

import OutlineTabSlot from '@src/slots/OutlineTabSlot';
import CourseTabPage from './CourseTabPage';

// The outline route's page: the route params go to the tab's slot as props.
const OutlinePage = () => {
  const { courseId } = useParams() as { courseId: string };
  return (
    <CourseTabPage courseId={courseId} tabSlug="outline">
      <OutlineTabSlot courseId={courseId} />
    </CourseTabPage>
  );
};

export default OutlinePage;
