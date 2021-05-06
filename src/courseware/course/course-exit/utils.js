import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import messages from './messages';
import { useModel } from '../../../generic/model-store';

const COURSE_EXIT_MODES = {
  disabled: 0,
  celebration: 1,
  nonPassing: 2,
  inProgress: 3,
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

function getCourseExitMode(
  certificateData,
  hasScheduledContent,
  isEnrolled,
  userHasPassingGrade,
  courseExitPageIsActive = null,
) {
  const authenticatedUser = getAuthenticatedUser();

  if (courseExitPageIsActive === false || !authenticatedUser || !isEnrolled) {
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

  if (hasScheduledContent && !userHasPassingGrade) {
    return COURSE_EXIT_MODES.inProgress;
  }
  if (isEligibleForCertificate && !userHasPassingGrade) {
    return COURSE_EXIT_MODES.nonPassing;
  }
  if (isCelebratoryStatus) {
    return COURSE_EXIT_MODES.celebration;
  }
  return COURSE_EXIT_MODES.disabled;
}

// Returns null in order to render the default navigation text
function getCourseExitNavigation(courseId, intl) {
  const {
    certificateData,
    hasScheduledContent,
    isEnrolled,
    userHasPassingGrade,
    courseExitPageIsActive,
  } = useModel('coursewareMeta', courseId);
  const exitMode = getCourseExitMode(
    certificateData,
    hasScheduledContent,
    isEnrolled,
    userHasPassingGrade,
    courseExitPageIsActive,
  );
  const exitActive = exitMode !== COURSE_EXIT_MODES.disabled;

  let exitText;
  switch (exitMode) {
    case COURSE_EXIT_MODES.celebration:
      exitText = intl.formatMessage(messages.nextButtonComplete);
      break;
    case COURSE_EXIT_MODES.nonPassing:
      exitText = intl.formatMessage(messages.nextButtonEnd);
      break;
    default:
      exitText = null;
  }
  return { exitActive, exitText };
}

// Meant to be used as part of a button's onClick handler.
// For convenience, you can pass a falsy event and it will be ignored.
const logClick = (org, courseId, administrator, event, extraProperties) => {
  if (!event) {
    return;
  }

  sendTrackEvent(`edx.ui.lms.course_exit.${event}.clicked`, {
    org_key: org,
    courserun_key: courseId,
    is_staff: administrator,
    ...extraProperties,
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
  getCourseExitNavigation,
  logClick,
  logVisit,
};
