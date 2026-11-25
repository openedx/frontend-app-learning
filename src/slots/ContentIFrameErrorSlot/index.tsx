import { ErrorPage, Slot } from '@openedx/frontend-base';

export const contentIFrameErrorSlotId = 'org.openedx.frontend.slot.learning.contentIFrameError.v1';

export interface ContentIFrameErrorSlotProps {
  courseId: string;
  unitId: string;
}

const ContentIFrameErrorSlot = ({ courseId, unitId }: ContentIFrameErrorSlotProps) => (
  <Slot id={contentIFrameErrorSlotId} courseId={courseId} unitId={unitId}>
    <ErrorPage />
  </Slot>
);

export default ContentIFrameErrorSlot;
