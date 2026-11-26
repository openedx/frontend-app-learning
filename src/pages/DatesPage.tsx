import { useParams } from 'react-router-dom';

import DatesTabSlot from '@src/slots/DatesTabSlot';
import CourseTabPage from './CourseTabPage';

// The dates route's page: the route params go to the tab's slot as props.
const DatesPage = () => {
  const { courseId } = useParams() as { courseId: string };
  return (
    <CourseTabPage courseId={courseId} tabSlug="dates">
      <DatesTabSlot courseId={courseId} />
    </CourseTabPage>
  );
};

export default DatesPage;
