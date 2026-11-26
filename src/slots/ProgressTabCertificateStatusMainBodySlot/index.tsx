import { Slot } from '@openedx/frontend-base';
import { breakpoints, useWindowSize } from '@openedx/paragon';

import CertificateStatus from '@src/course-home/progress-tab/certificate-status/CertificateStatus';

export const progressTabCertificateStatusMainBodySlotId = 'org.openedx.frontend.slot.learning.progressTabCertificateStatusMainBody.v1';

export interface ProgressTabCertificateStatusMainBodySlotProps {
  courseId: string;
}

const ProgressTabCertificateStatusMainBodySlot = ({ courseId }: ProgressTabCertificateStatusMainBodySlotProps) => {
  const windowWidth = useWindowSize().width;
  const wideScreen = (windowWidth ?? 0) >= (breakpoints.large.minWidth ?? 0);
  return (
    <Slot id={progressTabCertificateStatusMainBodySlotId} courseId={courseId}>
      {windowWidth && !wideScreen && <CertificateStatus />}
    </Slot>
  );
};

export default ProgressTabCertificateStatusMainBodySlot;
