import { useParams } from 'react-router-dom';
import { Icon, Stack } from '@openedx/paragon';

import { usePathway, usePathwayItems } from '../data/apiHooks';
import { ItemBadge } from '../item-badge/ItemBadge';
import { TabPage } from '../tab-page/TabPage';
import { Shuffle } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { messages } from './messages';
import { ItemCard } from './ItemCard';

export const PathwayOutline = () => {
  const { pathwayId } = useParams();

  const metadataQuery = usePathway(pathwayId);
  const itemsQuery = usePathwayItems(pathwayId);

  const {
    pathway,
  } = metadataQuery.data ?? {};

  const items = itemsQuery.data;

  return (
    <TabPage
      activeTabSlug="outline"
      pathwayId={pathwayId}
      pathwayStatus={{
        metadataQuery,
        tabDataQuery: itemsQuery,
      }}
    >
      <Stack gap={2} className="align-items-start">
        <h1 className="mb-0">
          {pathway?.content.displayName}
        </h1>
        {pathway?.categoryLabel && (
          <ItemBadge
            categoryLabel={pathway.categoryLabel}
            categoryBackgroundColor={pathway.categoryBackgroundColor}
            categoryTextColor={pathway.categoryTextColor}
          />
        )}
      </Stack>
      <Stack className='mt-5' gap={2} direction='horizontal'>
        <Icon className="text-info-900 bg-info-200" src={Shuffle} />
        <FormattedMessage {...messages.completeMessage} values={{
          count: items?.length,
        }} />
      </Stack>
      <Stack className='my-3' gap={3}>
        {items?.map((item) => (
           <ItemCard key={item.id} item={item} />
        ))}
      </Stack>
    </TabPage>
  );
};
