import { Slot } from '@openedx/frontend-base';
import { breakpoints, useWindowSize } from '@openedx/paragon';

import CertificateStatus from '@src/course-home/progress-tab/certificate-status/CertificateStatus';

export const progressTabCertificateStatusSidePanelSlotId = 'org.openedx.frontend.slot.learning.progressTabCertificateStatusSidePanel.v1';

export interface ProgressTabCertificateStatusSidePanelSlotProps {
  courseId: string;
}

const ProgressTabCertificateStatusSidePanelSlot = ({ courseId }: ProgressTabCertificateStatusSidePanelSlotProps) => {
  const windowWidth = useWindowSize().width;
  const wideScreen = (windowWidth ?? 0) >= (breakpoints.large.minWidth ?? 0);
  return (
    <Slot id={progressTabCertificateStatusSidePanelSlotId} courseId={courseId}>
      {windowWidth && wideScreen && <CertificateStatus />}
    </Slot>
  );
};

export default ProgressTabCertificateStatusSidePanelSlot;
