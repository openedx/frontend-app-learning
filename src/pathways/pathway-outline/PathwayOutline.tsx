import { generatePath, Link, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Col, Icon, Row, Stack,
} from '@openedx/paragon';

import { DECODE_ROUTES } from '@src/constants';
import { CheckCircle, Shuffle } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useMarkPathwayAchievementsSeen, usePathway, usePathwayItems } from '../data/apiHooks';
import { ItemBadge } from '../item-badge/ItemBadge';
import { TabPage } from '../tab-page/TabPage';
import { messages } from './messages';
import { ItemCard } from './ItemCard';
import { PathwayOverview } from './PathwayOverview';

const AchievementsAlert = ({ pathwayId }: { pathwayId: string }) => {
  const { mutate: markAchievementsSeen } = useMarkPathwayAchievementsSeen();

  return (
    <Alert
      variant="success"
      icon={CheckCircle}
      actions={[
        <Button
          key="view-achievements"
          as={Link}
          to={generatePath(DECODE_ROUTES.PATHWAY_ACHIEVEMENTS, { pathwayId })}
          onClick={() => markAchievementsSeen(pathwayId)}
        >
          <FormattedMessage {...messages.achievementsAlertBtn} />
        </Button>,
      ]}
    >
      <Alert.Heading>
        <FormattedMessage {...messages.achievementsAlertTitle} />
      </Alert.Heading>
    </Alert>
  );
};

interface ResumePathwayAlertProps {
  categoryLabel: string;
  resumeUrl: string;
}

const ResumePathwayAlert = ({ categoryLabel, resumeUrl }: ResumePathwayAlertProps) => (
  <Alert
    actions={[
      <Button key="resume" href={resumeUrl}>
        <FormattedMessage
          {...messages.resumeAlertBtn}
          values={{ category: categoryLabel }}
        />
      </Button>,
    ]}
  >
    <Alert.Heading>
      <span className="h3">
        <FormattedMessage {...messages.resumeAlertTitle} />
      </span>
    </Alert.Heading>
  </Alert>
);

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
        <Col xs={12} md={8} lg={9} className="p-0">
          <Stack gap={2} className="align-items-start mb-5">
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
          {pathwayId && progress?.hasNewAchievements && (
            <AchievementsAlert pathwayId={pathwayId} />
          )}
          {progress?.resumeUrl && (
            <ResumePathwayAlert
              categoryLabel={pathway?.categoryLabel ?? ''}
              resumeUrl={progress.resumeUrl}
            />
          )}
          <Stack className="mt-5" gap={2} direction="horizontal">
            <Icon className="text-info-900 bg-info-200" src={Shuffle} />
            <FormattedMessage
              {...messages.completeMessage}
              values={{
                count: items?.length,
              }}
            />
          </Stack>
          <Stack className="my-3" gap={3}>
            {items?.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </Stack>
        </Col>
        <Col xs={12} md={4} lg={3} className="p-0 pl-md-4 mb-4">
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
