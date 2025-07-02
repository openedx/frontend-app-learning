import { PluginSlot } from '@openedx/frontend-plugin-framework';
import classNames from 'classnames';
import React from 'react';

type CourseTabList = Array<{
  title: string;
  slug: string;
  url: string;
}>;

export const CourseTabLinksSlot = ({ tabs, activeTabSlug }: { tabs: CourseTabList, activeTabSlug?: string }) => (
  <PluginSlot id="org.openedx.frontend.learning.course_tab_links.v1" pluginProps={{ activeTabSlug }}>
    {tabs.map(({ url, title, slug }) => (
      <a
        key={slug}
        className={classNames('nav-item flex-shrink-0 nav-link', { active: slug === activeTabSlug })}
        href={url}
      >
        {title}
      </a>
    ))}
  </PluginSlot>
);
