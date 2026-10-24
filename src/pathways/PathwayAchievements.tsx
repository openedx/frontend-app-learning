import { useParams } from 'react-router-dom';
import { usePathway } from './data/apiHooks';
import { TabPage } from './tab-page/TabPage';

export const PathwayAchievements = () => {
  const { pathwayId } = useParams();

  const metadataQuery = usePathway(pathwayId);

  return (
    <TabPage
      activeTabSlug='achievements'
      pathwayId={pathwayId}
      pathwayStatus={{ metadataQuery }}
    >
      Achievements
    </TabPage>
  );
};
