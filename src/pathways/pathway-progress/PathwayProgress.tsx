import { useParams } from 'react-router-dom';
import { usePathway, usePathwayAchievements, usePathwayProgress } from '../data/apiHooks';
import { TabPage } from '../tab-page/TabPage';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { Col, Row, Stack } from '@openedx/paragon';
import { AchievementsInfo } from './AchievementsInfo';
import { PathwayCompletion } from './pathway-completion/PathwayCompletion';
import { PathwayGrades } from './PathwayGrades';

export const PathwayProgress = () => {
  const { pathwayId } = useParams();

  const metadataQuery = usePathway(pathwayId);
  const pathwayProgress = usePathwayProgress(pathwayId);
  const pathwayAchievements = usePathwayAchievements(pathwayId);

  const categoryLabel = metadataQuery.data?.pathway.categoryLabel;

  const {
    itemCount,
    completedItemCount,
    grades,
  } = pathwayProgress.data ?? {};

  const hasAchievements = pathwayAchievements.data !== undefined && pathwayAchievements.data.length > 0;

  return (
    <TabPage
      activeTabSlug='progress'
      pathwayId={pathwayId}
      pathwayStatus={{
        metadataQuery,
        tabDataQueries: [pathwayProgress, pathwayAchievements]
      }}
    >
      <Stack gap={2}>
        <h1>
          <FormattedMessage {...messages.progressTitle} />
        </h1>
        <Row className="w-100 m-0">
          <Col xs={12} md={8} className="p-0">
            <Stack gap={2}>
              <PathwayCompletion
                categoryLabel={categoryLabel ?? ''}
                total={itemCount ?? 0}
                completed={completedItemCount ?? 0}
              />
              <h1>
                <FormattedMessage {...messages.gradesTitle} />
              </h1>
              <PathwayGrades grades={grades ?? []}/>
            </Stack>
          </Col>

          <Col xs={12} md={4} className="p-0 pl-md-4">
            <AchievementsInfo pathwayId={pathwayId!} hasAchievements={hasAchievements} />
          </Col>
        </Row>
      </Stack>
    </TabPage>
  );
};
