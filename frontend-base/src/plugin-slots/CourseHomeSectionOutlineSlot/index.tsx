import React from 'react';
import Section from '@src/course-home/outline-tab/section-outline/Section';

interface Props {
  expandAll: boolean;
  sections: object;
  sectionIds: string[];
}

// https://github.com/openedx/frontend-app-learning/issues/2185
const CourseHomeSectionOutlineSlot: React.FC<Props> = ({
  expandAll, sections, sectionIds,
}) => (
  <>
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
  </>
);

export default CourseHomeSectionOutlineSlot;
