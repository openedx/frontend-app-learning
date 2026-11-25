import { getSiteConfig, setSiteConfig } from '@openedx/frontend-base';
import { matchRoutes } from 'react-router-dom';

import { courseOutlineRole, coursewareRole } from '@src/constants';
import routes from '@src/routes';
import {
  getCourseExitUrl, getCourseOutlineUrl, getCoursewarePath, getCoursewareUrl, getSequenceUrl, getUnitUrl,
} from './urls';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345';
const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@67890';

const siteConfig = getSiteConfig();

afterEach(() => {
  setSiteConfig(siteConfig);
});

describe('getCourseOutlineUrl', () => {
  it('returns a URL that the route with the course outline role matches, with the same course', () => {
    const match = matchRoutes(routes, getCourseOutlineUrl(courseId))?.at(-1);

    expect(match?.route.handle?.roles).toContain(courseOutlineRole);
    expect(match?.params).toEqual({ courseId });
  });

  it('throws when no route provides the course outline role', () => {
    setSiteConfig({ ...siteConfig, apps: [] });

    expect(() => getCourseOutlineUrl(courseId)).toThrow(`No route provides the role ${courseOutlineRole}`);
  });
});

describe('getCoursewareUrl', () => {
  it('returns a URL that a route with the courseware role matches, with the same course', () => {
    const match = matchRoutes(routes, getCoursewareUrl(courseId))?.at(-1);

    expect(match?.route.handle?.roles).toContain(coursewareRole);
    expect(match?.params).toEqual({ courseId });
  });
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

describe('getCourseExitUrl', () => {
  it('returns the course end page under the courseware URL', () => {
    expect(getCourseExitUrl(courseId)).toEqual(`${getCoursewareUrl(courseId)}/course-end`);
  });
});

describe('getCoursewarePath', () => {
  it('returns the courseware URLs outside a preview', () => {
    expect(getCoursewarePath(false, courseId)).toEqual(getCoursewareUrl(courseId));
    expect(getCoursewarePath(false, courseId, sequenceId)).toEqual(getSequenceUrl(courseId, sequenceId));
    expect(getCoursewarePath(false, courseId, sequenceId, unitId)).toEqual(getUnitUrl(courseId, sequenceId, unitId));
  });

  it('prefixes sequences and units, which have preview routes, in a preview', () => {
    const sequenceMatch = matchRoutes(routes, getCoursewarePath(true, courseId, sequenceId))?.at(-1);
    const unitMatch = matchRoutes(routes, getCoursewarePath(true, courseId, sequenceId, unitId))?.at(-1);

    expect(getCoursewarePath(true, courseId, sequenceId)).toEqual(`/learning/preview/course/${courseId}/${sequenceId}`);
    expect(sequenceMatch?.params).toEqual({ courseId, sequenceId });
    expect(unitMatch?.params).toEqual({ courseId, sequenceId, unitId });
  });

  it('leaves the course root unprefixed in a preview, since it has no preview route', () => {
    expect(getCoursewarePath(true, courseId)).toEqual(getCoursewareUrl(courseId));
  });
});

describe('getUnitUrl', () => {
  it('returns a URL that a route with the courseware role matches, with the same ids', () => {
    const match = matchRoutes(routes, getUnitUrl(courseId, sequenceId, unitId))?.at(-1);

    expect(match?.route.handle?.roles).toContain(coursewareRole);
    expect(match?.params).toEqual({ courseId, sequenceId, unitId });
  });
});
