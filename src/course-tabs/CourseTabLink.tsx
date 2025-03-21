import classNames from 'classnames';
import React from 'react';

interface CourseTabLinkProps {
  slug: string;
  activeTabSlug?: string;
  url: string;
  title: string;
}

export const CourseTabLink = ({
  slug, activeTabSlug, url, title,
}: CourseTabLinkProps) => (
  <a
    href={url}
    className={classNames('nav-item flex-shrink-0 nav-link', { active: slug === activeTabSlug })}
  >
    {title}
  </a>
);
