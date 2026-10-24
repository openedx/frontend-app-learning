import { useParams } from 'react-router-dom';
import { usePathway } from './data/apiHooks';
import { TabPage } from './tab-page/TabPage';

export const PathwayOutline = () => {
  const { pathwayId } = useParams();

  const metadataQuery = usePathway(pathwayId);

  return (
    <TabPage
      activeTabSlug='outline'
      pathwayId={pathwayId}
      pathwayStatus={{ metadataQuery }}
    >
      Outline
    </TabPage>
  );
};
