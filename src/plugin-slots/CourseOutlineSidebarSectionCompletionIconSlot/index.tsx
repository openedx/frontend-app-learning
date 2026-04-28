import {
  CompletionIcon,
  type CompletionIconProps,
} from '@src/courseware/course/sidebar/sidebars/course-outline/components/CompletionIcon';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import React from 'react';

interface Props extends CompletionIconProps {
  active: boolean;
}

export const CourseOverviewSectionCompletionIconSlot = ({ completionStat, enabled, active }: Props) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_outline_sidebar_section_completion_icon.v1"
    pluginProps={{ completionStat, enabled, active }}
  >
    <CompletionIcon completionStat={completionStat} enabled={enabled} />
  </PluginSlot>
);
