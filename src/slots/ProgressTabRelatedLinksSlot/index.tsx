import { Slot } from '@openedx/frontend-base';

import RelatedLinks from '@src/course-home/progress-tab/related-links/RelatedLinks';

export const progressTabRelatedLinksSlotId = 'org.openedx.frontend.slot.learning.progressTabRelatedLinks.v1';

export interface ProgressTabRelatedLinksSlotProps {
  courseId: string;
}

const ProgressTabRelatedLinksSlot = ({ courseId }: ProgressTabRelatedLinksSlotProps) => (
  <Slot id={progressTabRelatedLinksSlotId} courseId={courseId}>
    <RelatedLinks />
  </Slot>
);

export default ProgressTabRelatedLinksSlot;
