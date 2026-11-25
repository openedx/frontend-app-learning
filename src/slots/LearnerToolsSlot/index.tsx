import { getAuthenticatedUser, Slot } from '@openedx/frontend-base';
import { createPortal } from 'react-dom';

export const learnerToolsSlotId = 'org.openedx.frontend.slot.learning.learnerTools.v1';

export interface LearnerToolsSlotProps {
  courseId: string;
  sequenceId: string | null;
  unitId: string | null;
  userId: number;
  isStaff: boolean;
  enrollmentMode: string | null;
}

// The slot renders into `document.body`, outside the page layout, for tools that float over the page.
const LearnerToolsSlot = ({
  courseId, sequenceId, unitId, isStaff, enrollmentMode = null,
}: Omit<LearnerToolsSlotProps, 'userId' | 'enrollmentMode'> & { enrollmentMode?: string | null }) => {
  const authenticatedUser = getAuthenticatedUser();

  // Nothing for a learner who is not signed in.
  if (!authenticatedUser) {
    return null;
  }

  return createPortal(
    <Slot
      id={learnerToolsSlotId}
      courseId={courseId}
      sequenceId={sequenceId}
      unitId={unitId}
      userId={authenticatedUser.userId}
      isStaff={isStaff}
      enrollmentMode={enrollmentMode}
    />,
    document.body,
  );
};

export default LearnerToolsSlot;
