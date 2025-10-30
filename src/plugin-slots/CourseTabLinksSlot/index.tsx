import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { CourseTabLinksList } from '@src/course-tabs/CourseTabLinksList';
import React from 'react';

type CourseTabList = Array<{
  title: string;
  slug: string;
  url: string;
}>;

export const CourseTabLinksSlot = ({ tabs, activeTabSlug }: {
  tabs: CourseTabList,
  activeTabSlug?: string
}) => (
  <PluginSlot
    id="org.openedx.frontend.learning.course_tab_links.v1"
    pluginProps={{ activeTabSlug }}
  >
    <CourseTabLinksList tabs={tabs} activeTabSlug={activeTabSlug} />
  </PluginSlot>
);
