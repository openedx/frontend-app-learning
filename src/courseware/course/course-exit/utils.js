import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { useModel } from '../../../generic/model-store';

import messages from './messages';

const COURSE_EXIT_MODES = {
  disabled: 0,
  celebration: 1,
  nonPassing: 2,
};

// These are taken from the edx-platform `get_cert_data` function found in lms/courseware/views/views.py
const CELEBRATION_STATUSES = [
  'audit_passing',
  'downloadable',
  'earned_but_not_available',
  'honor_passing',
  'requesting',
  'unverified',
];
const NON_CERTIFICATE_STATUSES = [ // no certificate will be given, though a valid certificateData block is provided
  'audit_passing',
  'honor_passing', // provided when honor is configured to not give a certificate
];

function getCourseExitMode(courseId) {
  const {
    certificateData,
    courseExitPageIsActive,
    userHasPassingGrade,
  } = useModel('courses', courseId);

  if (!courseExitPageIsActive) {
    return COURSE_EXIT_MODES.disabled;
  }

  // Set defaults for our status-calculated variables, used when no certificateData is provided.
  // This happens when `get_cert_data` in edx-platform returns None, which it does if we are
  // in a certificate-earning mode, but the certificate is not available (maybe they didn't pass
  // or course is not set up for certificates or something). Audit users will always have a
  // certificateData sent over.
  let isCelebratoryStatus = true;
  let isEligibleForCertificate = true;

  if (certificateData) {
    const { certStatus } = certificateData;
    isCelebratoryStatus = CELEBRATION_STATUSES.indexOf(certStatus) !== -1;
    isEligibleForCertificate = NON_CERTIFICATE_STATUSES.indexOf(certStatus) === -1;
  }

  if (isEligibleForCertificate && !userHasPassingGrade) {
    return COURSE_EXIT_MODES.nonPassing;
  }
  if (isCelebratoryStatus) {
    return COURSE_EXIT_MODES.celebration;
  }
  return COURSE_EXIT_MODES.disabled;
}

// Returns null if course exit is either not active or not handling the current case
function getCourseExitText(courseId, intl) {
  switch (getCourseExitMode(courseId)) {
    case COURSE_EXIT_MODES.celebration:
      return intl.formatMessage(messages.nextButtonComplete);
    case COURSE_EXIT_MODES.nonPassing:
      return intl.formatMessage(messages.nextButtonEnd);
    default:
      return null;
  }
}

// Meant to be used as part of a button's onClick handler.
// For convenience, you can pass a falsy event and it will be ignored.
const logClick = (org, courseId, administrator, event) => {
  if (!event) {
    return;
  }

  sendTrackEvent(`edx.ui.lms.course_exit.${event}.clicked`, {
    org_key: org,
    courserun_key: courseId,
    is_staff: administrator,
  });
};

// Use like the following to call this only once on initial page load:
// useEffect(() => logVisit(org, courseId, administrator, variant), [org, courseId, administrator, variant]);
// For convenience, you can pass a falsy variant and it will be ignored.
const logVisit = (org, courseId, administrator, variant) => {
  if (!variant) {
    return;
  }

  sendTrackEvent('edx.ui.lms.course_exit.visited', {
    org_key: org,
    courserun_key: courseId,
    is_staff: administrator,
    variant,
  });
};

export {
  COURSE_EXIT_MODES,
  getCourseExitMode,
  getCourseExitText,
  logClick,
  logVisit,
};
