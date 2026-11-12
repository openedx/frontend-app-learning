import { breakpoints, useWindowSize } from '@openedx/paragon';
import CertificateStatus from '../../course-home/progress-tab/certificate-status/CertificateStatus';

// https://github.com/openedx/frontend-app-learning/issues/2185
const ProgressTabCertificateStatusMainBodySlot = () => {
  const windowWidth = useWindowSize().width;
  const wideScreen = windowWidth >= breakpoints.large.minWidth;
  return (
    <>
      {windowWidth && !wideScreen && <CertificateStatus />}
    </>
  );
};

ProgressTabCertificateStatusMainBodySlot.propTypes = {};

export default ProgressTabCertificateStatusMainBodySlot;
