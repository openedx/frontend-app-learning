import { useParams } from 'react-router-dom';

import ProgressTabSlot from '@src/slots/ProgressTabSlot';
import CourseTabPage from './CourseTabPage';

// The progress routes' page, with or without a learner to show: the route params go to the tab's slot as props.
const ProgressPage = () => {
  const { courseId, targetUserId } = useParams() as { courseId: string; targetUserId?: string };
  return (
    <CourseTabPage courseId={courseId} tabSlug="progress">
      <ProgressTabSlot courseId={courseId} targetUserId={targetUserId} />
    </CourseTabPage>
  );
};

export default ProgressPage;
