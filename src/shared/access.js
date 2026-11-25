// This function inspects an access denied error and provides a redirect url (looks like a /redirect/... path),
// which the redirect route's loaders send on to the destination.
// This is basically a frontend version of check_course_access_with_redirect in the backend.
export function getAccessDeniedRedirectUrl(courseId, activeTabSlug, courseAccess) {
  let url = null;
  switch (courseAccess.errorCode) {
    case 'audit_expired':
    case 'course_not_started':
    case 'unfulfilled_milestones':
      url = '/redirect/dashboard';
      break;
    case 'course_not_started_enterprise_learner':
      url = '/redirect/enterprise-learner-dashboard';
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
    case 'authentication_required':
    case 'enrollment_required':
    default:
      if (activeTabSlug !== 'outline') {
        url = `/course/${courseId}/home`;
      }
  }
  return url;
}
