import { useModel } from '../../../generic/model-store';

import messages from './messages';

const COURSE_EXIT_MODES = {
  disabled: 0,
  celebration: 1,
  nonPassing: 2,
};

// These are taken from the edx-platform `get_cert_data` function found in lms/courseware/views/views.py
const CELEBRATION_STATUSES = [
  'downloadable',
  'earned_but_not_available',
  'requesting',
  'unverified',
];
const NON_CERTIFICATE_STATUSES = [ // no certificate will be given, though a valid certificateData block is provided
  'audit_passing',
  'honor_passing', // honor can be configured to not give a certificate
];

function getCourseExitMode(courseId) {
  const {
    certificateData,
    courseExitPageIsActive,
    userHasPassingGrade,
  } = useModel('courses', courseId);

  if (!courseExitPageIsActive || !certificateData) {
    return COURSE_EXIT_MODES.disabled;
  }

  const {
    certStatus,
  } = certificateData;
  const isEligibleForCertificate = NON_CERTIFICATE_STATUSES.indexOf(certStatus) === -1;

  if (isEligibleForCertificate && !userHasPassingGrade) {
    return COURSE_EXIT_MODES.nonPassing;
  }
  if (CELEBRATION_STATUSES.indexOf(certStatus) !== -1) {
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

export { COURSE_EXIT_MODES, getCourseExitMode, getCourseExitText };
