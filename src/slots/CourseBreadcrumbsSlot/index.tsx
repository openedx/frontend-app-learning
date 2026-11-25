import { Slot } from '@openedx/frontend-base';

export const courseBreadcrumbsSlotId = 'org.openedx.frontend.slot.learning.courseBreadcrumbs.v1';

export interface CourseBreadcrumbsSlotProps {
  courseId: string;
  sectionId?: string | null;
  sequenceId?: string | null;
  unitId?: string | null;
  isStaff?: boolean;
}

const CourseBreadcrumbsSlot = ({
  courseId, sectionId, sequenceId, unitId, isStaff,
}: CourseBreadcrumbsSlotProps) => (
  <Slot
    id={courseBreadcrumbsSlotId}
    courseId={courseId}
    sectionId={sectionId}
    sequenceId={sequenceId}
    unitId={unitId}
    isStaff={isStaff}
  />
);

export default CourseBreadcrumbsSlot;
