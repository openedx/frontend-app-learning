import { CourseTabLink } from '@src/course-tabs/CourseTabLink';
import React from 'react';

import { TabMetadata } from './utils';

interface CourseTabLinkListProps {
  tabs: TabMetadata[],
  activeTabSlug?: string;
}

export const CourseTabLinksList = ({ tabs, activeTabSlug }: CourseTabLinkListProps) => (
  <>
    {tabs.map(({ url, title, tabId }) => (
      <CourseTabLink
        key={tabId}
        url={url}
        slug={tabId}
        title={title}
        activeTabSlug={activeTabSlug}
      />
    ))}
  </>
);
