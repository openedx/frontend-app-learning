import classNames from 'classnames';
import React from 'react';

import { isActiveTab } from './utils';

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
    className={classNames('nav-item flex-shrink-0 nav-link', { active: isActiveTab(slug, activeTabSlug) })}
  >
    {title}
  </a>
);
