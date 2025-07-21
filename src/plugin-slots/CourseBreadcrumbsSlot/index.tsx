import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

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
    id="org.openedx.frontend.learning.course_breadcrumbs.v1"
    idAliases={['course_breadcrumbs_slot']}
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      courseId,
      sectionId,
      sequenceId,
      unitId,
      isStaff,
    }}
  />
);
