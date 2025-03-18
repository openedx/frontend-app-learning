import React from 'react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import Section from '@src/course-home/outline-tab/section-outline/Section';

interface Props {
  expandAll: boolean;
  sections: object;
  sectionIds: string[];
}

const CourseHomeSectionOutlineSlot: React.FC<Props> = ({
  expandAll, sections, sectionIds,
}) => (
  <PluginSlot
    id="course_home_section_outline_slot"
    pluginProps={{ expandAll, sectionIds, sections }}
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
  </PluginSlot>
);

export default CourseHomeSectionOutlineSlot;
