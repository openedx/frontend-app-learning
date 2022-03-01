/* eslint-disable import/prefer-default-export */
import { getLocale } from '@edx/frontend-platform/i18n';

// This function inspects an access denied error and provides a redirect url (looks like a /redirect/... path),
// which then renders a nice little message while the browser loads the next page.
// This is basically a frontend version of check_course_access_with_redirect in the backend.
export function getAccessDeniedRedirectUrl(courseId, activeTabSlug, canLoadCourseware, courseAccess, start, unitId) {
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
    case 'authentication_required':
    case 'enrollment_required':
    default:
      // if the learner has access to the course, but it is not enabled in the mfe, there is no
      // error message, canLoadCourseware will be false.
      if (activeTabSlug === 'courseware' && canLoadCourseware === false && unitId) {
        url = `/redirect/courseware/${courseId}/unit/${unitId}`;
      } else if (activeTabSlug !== 'outline') {
        url = `/redirect/course-home/${courseId}`;
      }
  }
  return url;
}
