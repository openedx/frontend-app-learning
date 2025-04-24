import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

const ProgressCertificateStatusSlot = ({ courseId, children }) => (
  <PluginSlot
    id="org.openedx.frontend.learning.progress_certificate_status.v1"
    idAliases={['progress_certificate_status_slot']}
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
