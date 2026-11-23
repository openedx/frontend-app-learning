import { useParams } from 'react-router-dom';
import { usePathway } from './data/apiHooks';
import { TabPage } from './tab-page/TabPage';
import { PATHWAY_TAB_SLUGS } from './pathway-tabs/constants';

export const PathwayProgress = () => {
  const { pathwayId } = useParams();

  const metadataQuery = usePathway(pathwayId);

  return (
    <TabPage
      activeTabSlug={PATHWAY_TAB_SLUGS.PROGRESS}
      pathwayId={pathwayId}
      pathwayStatus={{ metadataQuery }}
    >
      Progress
    </TabPage>
  );
};
