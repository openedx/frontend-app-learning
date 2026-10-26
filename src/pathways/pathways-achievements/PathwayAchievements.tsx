import { useParams } from 'react-router-dom';
import { usePathway, usePathwayAchievements } from '../data/apiHooks';
import { TabPage } from '../tab-page/TabPage';
import { CardGrid } from '@openedx/paragon';
import { CertificateCard } from './CertificateCard';

export const PathwayAchievements = () => {
  const { pathwayId } = useParams();

  const metadataQuery = usePathway(pathwayId);
  const tabDataQuery = usePathwayAchievements(pathwayId);

  return (
    <TabPage
      activeTabSlug='achievements'
      pathwayId={pathwayId}
      pathwayStatus={{ metadataQuery, tabDataQuery }}
    >
      <CardGrid columnSizes={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
        {tabDataQuery.data?.map((data) => (
          <CertificateCard
            key={data.credentialId} 
            categoryLabel={metadataQuery.data?.pathway.categoryLabel}
            {...data}
          />
        ))}
      </CardGrid>
    </TabPage>
  );
};
