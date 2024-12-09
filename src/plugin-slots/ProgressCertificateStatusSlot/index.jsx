import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

const ProgressCertificateStatusSlot = ({ courseId, children }) => (
  <PluginSlot
    id="progress_certificate_status_slot"
    pluginProps={{ courseId }}
  >
    {children}
  </PluginSlot>
);

ProgressCertificateStatusSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ProgressCertificateStatusSlot;
