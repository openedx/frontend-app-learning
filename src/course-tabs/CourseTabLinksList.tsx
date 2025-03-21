import { CourseTabLink } from '@src/course-tabs/CourseTabLink';
import React from 'react';

interface CourseTabLinkListProps {
  tabs: Array<{
    title: string;
    slug: string;
    url: string;
  }>,
  activeTabSlug?: string;
}

export const CourseTabLinksList = ({ tabs, activeTabSlug }: CourseTabLinkListProps) => (
  <>
    {tabs.map(({ url, title, slug }) => (
      <CourseTabLink
        key={slug}
        url={url}
        slug={slug}
        title={title}
        activeTabSlug={activeTabSlug}
      />
    ))}
  </>
);
