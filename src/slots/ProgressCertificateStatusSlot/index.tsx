import { Slot } from '@openedx/frontend-base';
import type { ReactNode } from 'react';

export const progressCertificateStatusSlotId = 'org.openedx.frontend.slot.learning.progressCertificateStatus.v1';

export interface ProgressCertificateStatusSlotProps {
  courseId: string;
}

// The default content is the certificate card's body, which `CertificateStatus` builds and passes in.
const ProgressCertificateStatusSlot = ({
  courseId, children,
}: ProgressCertificateStatusSlotProps & { children: ReactNode }) => (
  <Slot id={progressCertificateStatusSlotId} courseId={courseId}>
    {children}
  </Slot>
);

export default ProgressCertificateStatusSlot;
