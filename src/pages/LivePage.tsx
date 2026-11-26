import { useParams } from 'react-router-dom';

import LiveTabSlot from '@src/slots/LiveTabSlot';
import CourseTabPage from './CourseTabPage';

// The live route's page: the route params go to the tab's slot as props.
const LivePage = () => {
  const { courseId } = useParams() as { courseId: string };
  return (
    <CourseTabPage courseId={courseId} tabSlug="lti_live">
      <LiveTabSlot courseId={courseId} />
    </CourseTabPage>
  );
};

export default LivePage;
