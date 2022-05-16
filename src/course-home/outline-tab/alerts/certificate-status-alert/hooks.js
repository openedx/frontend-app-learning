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
  const VERIFIED_MODES = {
    PROFESSIONAL: 'professional',
    VERIFIED: 'verified',
    NO_ID_PROFESSIONAL_MODE: 'no-id-professional',
    CREDIT_MODE: 'credit',
    MASTERS: 'masters',
    EXECUTIVE_EDUCATION: 'executive-education',
  };

  const {
    isEnrolled,
    org,
    tabs,
  } = useModel('courseHomeMeta', courseId);

  const {
    datesWidget: {
      courseDateBlocks,
    },
    certData,
    hasEnded,
    userHasPassingGrade,
    userTimezone,
    enrollmentMode,
  } = useModel('outline', courseId);

  const {
    certStatus,
    certWebViewUrl,
    certificateAvailableDate,
  } = certData || {};
  const endBlock = courseDateBlocks.find(b => b.dateType === 'course-end-date');
  const isVerifiedEnrollmentMode = (
    enrollmentMode !== null
    && enrollmentMode !== undefined
    && !!Object.values(VERIFIED_MODES).find(mode => mode === enrollmentMode)
  );
  let certURL = '';
  if (certWebViewUrl) {
    certURL = `${getConfig().LMS_BASE_URL}${certWebViewUrl}`;
  }
  const hasAlertingCertStatus = verifyCertStatusType(certStatus);

  // Only show if:
  // - there is a known cert status that we want provide status on.
  // - Or the course has ended and the learner does not have a passing grade.
  const isVisible = isEnrolled && hasAlertingCertStatus;
  const notPassingCourseEnded = (
    isEnrolled
    && isVerifiedEnrollmentMode
    && !hasAlertingCertStatus
    && hasEnded
    && !userHasPassingGrade
  );
  const payload = {
    certificateAvailableDate,
    certURL,
    certStatus,
    courseId,
    courseEndDate: endBlock && endBlock.date,
    userTimezone,
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
