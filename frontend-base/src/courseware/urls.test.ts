import { getSiteConfig, setSiteConfig } from '@openedx/frontend-base';
import { matchRoutes } from 'react-router-dom';

import { coursewareRole } from '@src/constants';
import routes from '@src/routes';
import { getSequenceUrl } from './urls';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345';

const siteConfig = getSiteConfig();

afterEach(() => {
  setSiteConfig(siteConfig);
});

describe('getSequenceUrl', () => {
  it('returns a URL that a route with the courseware role matches, with the same ids', () => {
    const match = matchRoutes(routes, getSequenceUrl(courseId, sequenceId))?.at(-1);

    expect(match?.route.handle?.roles).toContain(coursewareRole);
    expect(match?.params).toEqual({ courseId, sequenceId });
  });

  it('throws when no route provides the courseware role', () => {
    setSiteConfig({ ...siteConfig, apps: [] });

    expect(() => getSequenceUrl(courseId, sequenceId)).toThrow(`No route provides the role ${coursewareRole}`);
  });
});
