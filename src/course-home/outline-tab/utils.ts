import camelCase from 'lodash.camelcase';

export const readableProctoringStatuses = {
  notStarted: 'notStarted',
  started: 'started',
  submitted: 'submitted',
  verified: 'verified',
  rejected: 'rejected',
  error: 'error',
  otherCourseApproved: 'otherCourseApproved',
  expiringSoon: 'expiringSoon',
  expired: 'expired',
} as const;

type ReadableProctoringStatus = typeof readableProctoringStatuses[keyof typeof readableProctoringStatuses] | '';

function getReadableProctoringStatusClass(examStatus?: string): ReadableProctoringStatus {
  let readableClass: ReadableProctoringStatus = '';
  if (!examStatus || ['created', 'download_software_clicked', 'ready_to_start'].includes(examStatus)) {
    readableClass = readableProctoringStatuses.notStarted;
  } else if (['started', 'ready_to_submit'].includes(examStatus)) {
    readableClass = readableProctoringStatuses.started;
  } else if (['second_review_required', 'submitted'].includes(examStatus)) {
    readableClass = readableProctoringStatuses.submitted;
  } else {
    const examStatusCamelCase = camelCase(examStatus);
    if (examStatusCamelCase in readableProctoringStatuses) {
      readableClass = readableProctoringStatuses[examStatusCamelCase as keyof typeof readableProctoringStatuses];
    }
  }
  return readableClass;
}

// The onboarding-status endpoint's raw response (snake_case), as getProctoringInfoData returns it.
interface ProctoringInfo {
  onboarding_status?: string;
  expiration_date?: string | null;
}

export function getReadableProctoringStatus(response: ProctoringInfo): ReadableProctoringStatus {
  const expirationDate = response.expiration_date;
  if (expirationDate) {
    const now = new Date().getTime();
    const expiresAt = new Date(expirationDate).getTime();
    if (now >= expiresAt) {
      return getReadableProctoringStatusClass('expired');
    }
    // Expiring within 28 days
    const twentyeightDays = 28 * 24 * 60 * 60 * 1000;
    if (now > expiresAt - twentyeightDays) {
      return getReadableProctoringStatusClass('expiringSoon');
    }
  }
  return getReadableProctoringStatusClass(response.onboarding_status);
}
