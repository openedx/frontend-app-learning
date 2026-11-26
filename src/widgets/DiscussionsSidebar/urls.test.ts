import { discussionsSidebarRole } from '@src/constants';
import { addExternalRoute, addTestApp } from '@src/tests/slots';

import { getDiscussionsSidebarUrl } from './urls';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';

describe('getDiscussionsSidebarUrl', () => {
  it("appends the unit's sub-path to the external route the site declares for the role", () => {
    addExternalRoute(discussionsSidebarRole, 'http://localhost:2002/discussions/sidebar/');

    expect(getDiscussionsSidebarUrl(courseId, unitId))
      .toBe(`http://localhost:2002/discussions/sidebar/${courseId}/category/${unitId}`);
  });

  it("appends the unit's sub-path to the route of the installed app that provides the role", () => {
    addTestApp({ routes: [{ path: '/discussions/sidebar', handle: { roles: [discussionsSidebarRole] } }] });

    expect(getDiscussionsSidebarUrl(courseId, unitId)).toBe(`/discussions/sidebar/${courseId}/category/${unitId}`);
  });

  it('is null when nothing provides the role', () => {
    expect(getDiscussionsSidebarUrl(courseId, unitId)).toBeNull();
  });
});
