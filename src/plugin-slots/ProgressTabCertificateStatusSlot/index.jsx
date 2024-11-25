import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import CertificateStatus from '../../course-home/progress-tab/certificate-status/CertificateStatus';

const ProgressTabCertificateStatusSlot = ({ placement }) => (
  <PluginSlot
    id="progress_tab_certificate_status_slot"
    pluginProps={{
      placement,
    }}
  >
    <CertificateStatus />
  </PluginSlot>
);

ProgressTabCertificateStatusSlot.propTypes = {
  placement: PropTypes.oneOf(['MAIN_BODY', 'SIDEBAR']),
};

export default ProgressTabCertificateStatusSlot;
