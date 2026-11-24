import { PathwayTabLink } from './PathwayTabLink';
import type { PathwayTabMetadata } from './types';

interface PathwayTabLinksListProps {
  tabs: PathwayTabMetadata[];
  activeTabSlug?: string;
}

export const PathwayTabLinksList = ({ tabs, activeTabSlug }: PathwayTabLinksListProps) => (
  <>
    {tabs.map(({ url, title, tabId }) => (
      <PathwayTabLink
        key={tabId}
        url={url}
        slug={tabId}
        title={title}
        activeTabSlug={activeTabSlug}
      />
    ))}
  </>
);
