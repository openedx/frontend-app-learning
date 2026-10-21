import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { CourseTabLinksList } from '@src/course-tabs/CourseTabLinksList';
import { TabMetadata } from '@src/course-tabs/utils';
import React from 'react';

export const CourseTabLinksSlot = ({ tabs, activeTabSlug }: {
  tabs: TabMetadata[],
  activeTabSlug?: string
}) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_tab_links.v1"
    pluginProps={{ activeTabSlug }}
  >
    <CourseTabLinksList tabs={tabs} activeTabSlug={activeTabSlug} />
  </PluginSlot>
);
