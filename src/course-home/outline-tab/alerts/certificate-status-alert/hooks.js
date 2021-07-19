import React, { useMemo } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useAlert } from '../../../../generic/user-messages';
import { useModel } from '../../../../generic/model-store';

import { CERT_STATUS_TYPE } from './CertificateStatusAlert';

const CertificateStatusAlert = React.lazy(() => import('./CertificateStatusAlert'));

function verifyCertStatusType(status) {
  switch (status) {
    case CERT_STATUS_TYPE.DOWNLOADABLE:
    case CERT_STATUS_TYPE.EARNED_NOT_AVAILABLE:
    case CERT_STATUS_TYPE.REQUESTING:
    case CERT_STATUS_TYPE.UNVERIFIED:
      return true;
    default:
      return false;
  }
}

function useCertificateStatusAlert(courseId) {
  const {
    isEnrolled,
    org,
    tabs,
  } = useModel('courseHomeMeta', courseId);

  const {
    datesWidget: {
      courseDateBlocks,
      userTimezone,
    },
    certData,
    hasEnded,
    userHasPassingGrade,
  } = useModel('outline', courseId);

  const {
    certStatus,
    certWebViewUrl,
    certificateAvailableDate,
    downloadUrl,
  } = certData || {};
  const endBlock = courseDateBlocks.find(b => b.dateType === 'course-end-date');
  const isWebCert = downloadUrl === null;

  let certURL = '';
  if (certWebViewUrl) {
    certURL = `${getConfig().LMS_BASE_URL}${certWebViewUrl}`;
  } else if (downloadUrl) {
    // PDF Certificate
    certURL = downloadUrl;
  }
  const hasAlertingCertStatus = verifyCertStatusType(certStatus);
  const notPassingCourseEnded = !hasAlertingCertStatus && hasEnded && !userHasPassingGrade;

  // Only show if there is a known cert status that we want provide status on.
  const isVisible = isEnrolled && hasAlertingCertStatus;
  const payload = {
    certificateAvailableDate,
    certURL,
    certStatus,
    courseId,
    courseEndDate: endBlock && endBlock.date,
    userTimezone,
    isWebCert,
    org,
    notPassingCourseEnded,
    tabs,
  };

  useAlert(isVisible || notPassingCourseEnded, {
    code: 'clientCertificateStatusAlert',
    payload: useMemo(() => payload, Object.values(payload).sort()),
    topic: 'outline-course-alerts',
  });

  return {
    clientCertificateStatusAlert: CertificateStatusAlert,
  };
}

export default useCertificateStatusAlert;
