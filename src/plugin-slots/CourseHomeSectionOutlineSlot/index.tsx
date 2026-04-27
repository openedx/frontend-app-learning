import React from 'react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import Section from '@src/course-home/outline-tab/section-outline/Section';

interface Props {
  expandAll: boolean;
  sections: object;
  sectionIds: string[];
  showOutlineEstimatedTime?: boolean;
}

const CourseHomeSectionOutlineSlot: React.FC<Props> = ({
  expandAll, sections, sectionIds, showOutlineEstimatedTime = true,
}) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_home_section_outline.v1"
    idAliases={['course_home_section_outline_slot']}
    pluginProps={{ expandAll, sectionIds, sections }}
  >
    <ol id="courseHome-outline" className="list-unstyled">
      {sectionIds.map((sectionId) => (
        <Section
          key={sectionId}
          defaultOpen={sections[sectionId].resumeBlock}
          expand={expandAll}
          section={sections[sectionId]}
          // Pass showOutlineEstimatedTime down to the Section component to control whether
          // to show the estimated time for sections and sequences in the course outline
          showOutlineEstimatedTime={showOutlineEstimatedTime}
        />
      ))}
    </ol>
  </PluginSlot>
);

export default CourseHomeSectionOutlineSlot;
