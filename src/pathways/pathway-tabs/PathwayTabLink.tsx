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
}: PathwayTabLinkProps) => {
  const isActive = slug === activeTabSlug;
  return (
    <Link
      to={url}
      aria-current={isActive ? 'page' : undefined}
      className={classNames('nav-item flex-shrink-0 nav-link', { active: isActive })}
    >
      {title}
    </Link>
  );
};
