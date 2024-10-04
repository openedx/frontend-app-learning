import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import CertificateStatus from '../../course-home/progress-tab/certificate-status/CertificateStatus';

const ProgressTabCertificateStatusSlot = ({ courseId }) => (
  <PluginSlot
    id="progress_tab_certificate_status_slot"
    pluginProps={{
      courseId,
    }}
  >
    <CertificateStatus />
  </PluginSlot>
);

ProgressTabCertificateStatusSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default ProgressTabCertificateStatusSlot;
