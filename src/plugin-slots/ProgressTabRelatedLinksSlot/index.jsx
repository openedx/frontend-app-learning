import { PluginSlot } from '@openedx/frontend-plugin-framework';
import RelatedLinks from '../../course-home/progress-tab/related-links/RelatedLinks';

const ProgressTabRelatedLinksSlot = () => (
  <PluginSlot
    id="progress_tab_related_links_slot"
  >
    <RelatedLinks />
  </PluginSlot>
);

ProgressTabRelatedLinksSlot.propTypes = {};

export default ProgressTabRelatedLinksSlot;
