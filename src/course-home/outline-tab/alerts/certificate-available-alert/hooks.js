import React, { useMemo } from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { useAlert } from '../../../../generic/user-messages';
import { useModel } from '../../../../generic/model-store';

const CertificateAvailableAlert = React.lazy(() => import('./CertificateAvailableAlert'));

function useCertificateAvailableAlert(courseId) {
  const {
    isEnrolled,
  } = useModel('courses', courseId);
  const {
    datesWidget: {
      courseDateBlocks,
      userTimezone,
    },
  } = useModel('outline', courseId);
  const authenticatedUser = getAuthenticatedUser();
  const username = authenticatedUser ? authenticatedUser.username : '';

  const certBlock = courseDateBlocks.find(b => b.dateType === 'certificate-available-date');
  const endBlock = courseDateBlocks.find(b => b.dateType === 'course-end-date');
  const endDate = endBlock ? new Date(endBlock.date) : null;
  const hasEnded = endBlock ? endDate < new Date() : false;
  const isVisible = isEnrolled && certBlock && hasEnded; // only show if we're between end and cert dates
  const payload = {
    certDate: certBlock && certBlock.date,
    username,
    userTimezone,
  };

  useAlert(isVisible, {
    code: 'clientCertificateAvailableAlert',
    payload: useMemo(() => payload, Object.values(payload).sort()),
    topic: 'outline-course-alerts',
  });

  return {
    clientCertificateAvailableAlert: CertificateAvailableAlert,
  };
}

export default useCertificateAvailableAlert;
