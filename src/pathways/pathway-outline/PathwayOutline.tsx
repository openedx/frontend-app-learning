import { useParams } from 'react-router-dom';
import {
  Col, Icon, Row, Stack,
} from '@openedx/paragon';

import { usePathway, usePathwayItems } from '../data/apiHooks';
import { ItemBadge } from '../item-badge/ItemBadge';
import { TabPage } from '../tab-page/TabPage';
import { Shuffle } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { messages } from './messages';
import { ItemCard } from './ItemCard';
import { PathwayOverview } from './PathwayOverview';

export const PathwayOutline = () => {
  const { pathwayId } = useParams();

  const metadataQuery = usePathway(pathwayId);
  const itemsQuery = usePathwayItems(pathwayId);

  const {
    pathway,
    progress,
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
      <Row className="w-100 m-0">
        <Col xs={12} md={8} lg className="p-0">
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
        </Col>

        <Col xs={12} md={4} className="learning-pathway-outline-sidebar p-0 pl-md-4 mb-4">
          <PathwayOverview
            categoryLabel={pathway?.categoryLabel ?? ''}
            completed={progress?.completedItemCount ?? 0}
            total={pathway?.itemCount ?? 0}
            detailsUrl={pathway?.detailsUrl}
          />
        </Col>
      </Row>
    </TabPage>
  );
};
