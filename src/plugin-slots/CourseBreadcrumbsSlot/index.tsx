import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CourseBreadcrumbs from '../../courseware/course/CourseBreadcrumbs';

interface Props {
  courseId: string;
  sectionId?: string;
  sequenceId?: string;
  unitId?: string;
  isStaff?: boolean;
}

export const CourseBreadcrumbsSlot : React.FC<Props> = ({
  courseId, sectionId, sequenceId, unitId, isStaff,
}) => (
  <PluginSlot
    id="course_breadcrumbs_slot"
    slotOptions={{
      mergeProps: true,
    }}
  >
    <CourseBreadcrumbs
      courseId={courseId}
      sectionId={sectionId}
      sequenceId={sequenceId}
      isStaff={isStaff}
      unitId={unitId}
    />
  </PluginSlot>
);
