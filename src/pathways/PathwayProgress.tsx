import { useParams } from 'react-router-dom';
import { usePathway } from './data/apiHooks';
import { TabPage } from './tab-page/TabPage';

export const PathwayProgress = () => {
  const { pathwayId } = useParams();

  const metadataQuery = usePathway(pathwayId);

  return (
    <TabPage
      activeTabSlug='progress'
      pathwayId={pathwayId}
      pathwayStatus={{ metadataQuery }}
    >
      Progress
    </TabPage>
  );
};
