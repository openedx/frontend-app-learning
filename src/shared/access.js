/* eslint-disable import/prefer-default-export */
import { getLocale } from '@edx/frontend-platform/i18n';

// This function inspects an access denied error and provides a redirect url (looks like a /redirect/... path),
// which then renders a nice little message while the browser loads the next page.
// This is basically a frontend version of check_course_access_with_redirect in the backend.
export function getAccessDeniedRedirectUrl(courseId, activeTabSlug, courseAccess, start, unitId) {
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
    case 'unfulfilled_milestones':
      url = '/redirect/dashboard';
      break;
    case 'microfrontend_disabled':
      // This code path is only used by the courseware right now. The course home tabs each have their own check for
      // this in the tab-specific API calls. In those cases, the API will return an http status code if the MFE version
      // of those tabs are disabled, rather than an access error like this. We could try to unify these approaches, but
      // hopefully the legacy code isn't around long enough for that to be worth it.
      if (unitId) {
        url = `/redirect/courseware/${courseId}/unit/${unitId}`;
      }
      break;
    case 'authentication_required':
    case 'enrollment_required':
    default:
      if (activeTabSlug !== 'outline') {
        url = `/redirect/course-home/${courseId}`;
      }
  }
  return url;
}
