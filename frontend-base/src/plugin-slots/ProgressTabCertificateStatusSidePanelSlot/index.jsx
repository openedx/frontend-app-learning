import { breakpoints, useWindowSize } from '@openedx/paragon';
import CertificateStatus from '../../course-home/progress-tab/certificate-status/CertificateStatus';

// https://github.com/openedx/frontend-app-learning/issues/2185
const ProgressTabCertificateStatusSidePanelSlot = () => {
  const windowWidth = useWindowSize().width;
  const wideScreen = windowWidth >= breakpoints.large.minWidth;
  return (
    <>
      {windowWidth && wideScreen && <CertificateStatus />}
    </>
  );
};

ProgressTabCertificateStatusSidePanelSlot.propTypes = {};

export default ProgressTabCertificateStatusSidePanelSlot;
