/* eslint-disable import/prefer-default-export */
import { getLocale } from '@edx/frontend-platform/i18n';

// This function inspects an access denied error and provides a redirect url (looks like a /redirect/... path),
// which then renders a nice little message while the browser loads the next page.
// This is basically a frontend version of check_course_access_with_redirect in the backend.
export function getAccessDeniedRedirectUrl(courseId, activeTabSlug, courseAccess, start) {
  let url = null;
  switch (courseAccess.errorCode) {
    case 'audit_expired':
      url = `/redirect/dashboard?access_response_error=${courseAccess.additionalContextUserMessage}`;
      break;
    case 'course_not_started':
      // eslint-disable-next-line no-case-declarations
      const startDate = (new Intl.DateTimeFormat(getLocale())).format(new Date(start));
      url = `/redirect/dashboard?notlive=${startDate}`;
      break;
    case 'survey_required':
      url = `/redirect/survey/${courseId}`;
      break;
    case 'data_sharing_access_required':
      url = `/redirect/consent?consentPath=${encodeURIComponent(courseAccess.developerMessage)}`;
      break;
    case 'incorrect_active_enterprise':
      url = `/course/${courseId}/access-denied`;
      break;
    case 'unfulfilled_milestones':
      url = '/redirect/dashboard';
      break;
    case 'authentication_required':
    case 'enrollment_required':
    default:
      if (activeTabSlug !== 'outline') {
        url = `/course/${courseId}/home`;
      }
  }
  return url;
}
