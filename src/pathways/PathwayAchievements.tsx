import { useParams } from 'react-router-dom';
import { usePathway } from './data/apiHooks';
import { TabPage } from './tab-page/TabPage';
import { PATHWAY_TAB_SLUGS } from './pathway-tabs/constants';

export const PathwayAchievements = () => {
  const { pathwayId } = useParams();

  const metadataQuery = usePathway(pathwayId);

  return (
    <TabPage
      activeTabSlug={PATHWAY_TAB_SLUGS.ACHIEVEMENTS}
      pathwayId={pathwayId}
      pathwayStatus={{ metadataQuery }}
    >
      Achievements
    </TabPage>
  );
};
