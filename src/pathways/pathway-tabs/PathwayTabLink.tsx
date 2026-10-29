import classNames from 'classnames';
import { Link } from 'react-router-dom';

interface PathwayTabLinkProps {
  slug: string;
  activeTabSlug?: string;
  url: string;
  title: string;
}

export const PathwayTabLink = ({
  slug, activeTabSlug, url, title,
}: PathwayTabLinkProps) => (
  <Link
    to={url}
    className={classNames('nav-item flex-shrink-0 nav-link', { active: slug === activeTabSlug })}
  >
    {title}
  </Link>
);
