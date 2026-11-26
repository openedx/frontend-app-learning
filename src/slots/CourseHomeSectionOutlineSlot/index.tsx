import { Slot } from '@openedx/frontend-base';

import type { CourseHomeOutlineSection } from '@src/course-home/data/courseHomeOutline';
import Section from '@src/course-home/outline-tab/section-outline/Section';

export const courseHomeSectionOutlineSlotId = 'org.openedx.frontend.slot.learning.courseHomeSectionOutline.v1';

export interface CourseHomeSectionOutlineSlotProps {
  courseId: string;
  expandAll: boolean;
  sectionIds: string[];
  sections: Record<string, CourseHomeOutlineSection>;
}

const CourseHomeSectionOutlineSlot = ({
  courseId, expandAll, sectionIds, sections,
}: CourseHomeSectionOutlineSlotProps) => (
  <Slot
    id={courseHomeSectionOutlineSlotId}
    courseId={courseId}
    expandAll={expandAll}
    sectionIds={sectionIds}
    sections={sections}
  >
    <ol id="courseHome-outline" className="list-unstyled">
      {sectionIds.map((sectionId) => (
        <Section
          key={sectionId}
          defaultOpen={sections[sectionId].resumeBlock}
          expand={expandAll}
          section={sections[sectionId]}
        />
      ))}
    </ol>
  </Slot>
);

export default CourseHomeSectionOutlineSlot;
