import { getAccessDeniedRedirectUrl } from './access';

describe('getAccessDeniedRedirectUrl', () => {
  it('redirects an embargoed learner away from the outline tab, unlike enrollment_required', () => {
    const courseAccess = { errorCode: 'embargo' };
    expect(getAccessDeniedRedirectUrl('test-course', 'outline', courseAccess)).toBe('/redirect/embargo');
  });

  it('redirects an embargoed learner away from a non-outline tab too', () => {
    const courseAccess = { errorCode: 'embargo' };
    expect(getAccessDeniedRedirectUrl('test-course', 'dates', courseAccess)).toBe('/redirect/embargo');
  });
});
