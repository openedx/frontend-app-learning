import { getAccessDeniedRedirectUrl } from './access';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

describe('getAccessDeniedRedirectUrl', () => {
  it.each([
    ['survey_required', `/redirect/survey/${courseId}`],
    ['unfulfilled_milestones', '/redirect/dashboard'],
    ['course_not_started_enterprise_learner', '/redirect/enterprise-learner-dashboard'],
    ['incorrect_active_enterprise', `/course/${courseId}/access-denied`],
    ['authentication_required', `/course/${courseId}/home`],
    ['enrollment_required', `/course/${courseId}/home`],
    ['an_unknown_code', `/course/${courseId}/home`],
  ])('sends %s to %s', (errorCode, url) => {
    expect(getAccessDeniedRedirectUrl(courseId, 'dates', { errorCode })).toBe(url);
  });

  it('attaches the user message for audit_expired', () => {
    const courseAccess = { errorCode: 'audit_expired', additionalContextUserMessage: 'uhoh oh no' };
    expect(getAccessDeniedRedirectUrl(courseId, 'dates', courseAccess)).toBe('/redirect/dashboard?access_response_error=uhoh oh no');
  });

  it('attaches the start date for course_not_started', () => {
    const courseAccess = { errorCode: 'course_not_started' };
    expect(getAccessDeniedRedirectUrl(courseId, 'dates', courseAccess, '2013-02-05T05:00:00Z')).toBe('/redirect/dashboard?notlive=2/5/2013');
  });

  it('attaches the encoded consent path for data_sharing_access_required', () => {
    const courseAccess = { errorCode: 'data_sharing_access_required', developerMessage: '/consent?next=/course' };
    expect(getAccessDeniedRedirectUrl(courseId, 'dates', courseAccess)).toBe('/redirect/consent?consentPath=%2Fconsent%3Fnext%3D%2Fcourse');
  });

  it.each(['authentication_required', 'enrollment_required', 'an_unknown_code'])('does not redirect %s from the outline', (errorCode) => {
    expect(getAccessDeniedRedirectUrl(courseId, 'outline', { errorCode })).toBeNull();
  });
});
