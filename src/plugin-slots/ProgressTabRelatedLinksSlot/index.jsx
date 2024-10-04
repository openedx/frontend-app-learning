import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import RelatedLinks from '../../course-home/progress-tab/related-links/RelatedLinks';

const ProgressTabRelatedLinksSlot = ({ courseId }) => (
  <PluginSlot
    id="progress_tab_related_links_slot"
    pluginProps={{
      courseId,
    }}
  >
    <RelatedLinks />
  </PluginSlot>
);

ProgressTabRelatedLinksSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default ProgressTabRelatedLinksSlot;
