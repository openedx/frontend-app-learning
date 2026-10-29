import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { PathwayTabLinksList } from '@src/pathways/pathway-tabs/PathwayTabLinksList';
import type { PathwayTabMetadata } from '@src/pathways/pathway-tabs/types';

interface PathwayTabLinksSlotProps {
  tabs: PathwayTabMetadata[];
  activeTabSlug?: string;
}

export const PathwayTabLinksSlot = ({ tabs, activeTabSlug }: PathwayTabLinksSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.pathway_tab_links.v1"
    pluginProps={{ tabs, activeTabSlug }}
  >
    <PathwayTabLinksList tabs={tabs} activeTabSlug={activeTabSlug} />
  </PluginSlot>
);
