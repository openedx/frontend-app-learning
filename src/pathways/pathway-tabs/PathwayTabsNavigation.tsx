import { useIntl } from '@edx/frontend-platform/i18n';

import Tabs from '@src/generic/tabs/Tabs';
import { PathwayTabLinksSlot } from '@src/plugin-slots/PathwayTabLinksSlot';
import type { PathwayTabMetadata } from './types';
import messages from './messages';

export interface PathwayTabsNavigationProps {
  tabs: PathwayTabMetadata[];
  activeTabSlug?: string;
}

export const PathwayTabsNavigation = ({ tabs, activeTabSlug }: PathwayTabsNavigationProps) => {
  const intl = useIntl();

  return (
    <div className="mb-3 learning-pathway-tabs-navigation">
      <div className="container-xl">
        <Tabs
          className="nav-underline-tabs"
          aria-label={intl.formatMessage(messages.pathwayMaterial)}
        >
          <PathwayTabLinksSlot tabs={tabs} activeTabSlug={activeTabSlug} />
        </Tabs>
      </div>
    </div>
  );
};
