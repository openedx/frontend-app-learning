import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { breakpoints, useWindowSize } from '@openedx/paragon';
import CertificateStatus from '../../course-home/progress-tab/certificate-status/CertificateStatus';

const ProgressTabCertificateStatusMainBodySlot = () => {
  const windowWidth = useWindowSize().width;
  const wideScreen = windowWidth >= breakpoints.large.minWidth;
  return (
    <PluginSlot
      id="progress_tab_certificate_status_main_body_slot"
    >
      {windowWidth && !wideScreen && <CertificateStatus />}
    </PluginSlot>
  );
};

ProgressTabCertificateStatusMainBodySlot.propTypes = {};

export default ProgressTabCertificateStatusMainBodySlot;
