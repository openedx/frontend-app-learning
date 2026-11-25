import React from 'react';
import { getAnalyticsService } from '@openedx/frontend-base';
import { act, screen } from '@testing-library/react';
import { matchPath, useLocation } from 'react-router-dom';

import routes from '@src/routes';
import { renderRoutes, replacePages } from '@src/tests/render';
import { decodeUrl } from '.';

const decodedCourseId = 'course-v1:edX+DemoX+Demo_Course';
const encodedCourseId = encodeURIComponent(decodedCourseId);
const deepEncodedCourseId = (() => {
  let path = encodedCourseId;
  for (let i = 0; i < 5; i++) {
    path = encodeURIComponent(path);
  }
  return path;
})();

const { sendPageEvent } = getAnalyticsService();

const LandingProbe = () => <span data-testid="landing">{useLocation().pathname}</span>;

const renderAt = async (pathname) => {
  const { router } = renderRoutes(replacePages(routes, <LandingProbe />), pathname);
  const navigate = jest.spyOn(router, 'navigate');
  await screen.findByTestId('landing');

  return { router, navigate };
};

const renderPage = (props) => renderAt(`/learning${props?.pathname}`);

describe('DecodePageRoute', () => {
  beforeEach(() => {
    sendPageEvent.mockClear();
  });

  it('should not modify the url if it does not need to be decoded', async () => {
    const props = matchPath({
      path: '/course/:courseId/home',
    }, `/course/${decodedCourseId}/home`);
    const { navigate } = await renderPage(props);

    expect(props.pathname).toContain(decodedCourseId);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should decode the url and replace the history if necessary', async () => {
    const props = matchPath({
      path: '/course/:courseId/home',
    }, `/course/${encodedCourseId}/home`);
    const { navigate } = await renderPage(props);

    expect(props.pathname).not.toContain(decodedCourseId);
    expect(props.pathname).toContain(encodedCourseId);
    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: `/learning/course/${decodedCourseId}/home` }),
      expect.objectContaining({ replace: true }),
    );
  });

  it('should decode the url multiple times if necessary', async () => {
    const props = matchPath({
      path: '/course/:courseId/home',
    }, `/course/${deepEncodedCourseId}/home`);
    const { navigate } = await renderPage(props);

    expect(props.pathname).not.toContain(decodedCourseId);
    expect(props.pathname).toContain(deepEncodedCourseId);
    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: `/learning/course/${decodedCourseId}/home` }),
      expect.objectContaining({ replace: true }),
    );
  });

  it('should decode a preview url', async () => {
    const { router } = await renderAt(`/learning/preview/course/${encodedCourseId}/sequence`);

    expect(router.state.location.pathname).toEqual(`/learning/preview/course/${decodedCourseId}/sequence`);
  });

  it.each([
    ['learning', `/l%65arning/course/${decodedCourseId}/home`, `/learning/course/${decodedCourseId}/home`],
    ['course', `/learning/c%6Furse/${decodedCourseId}/home`, `/learning/course/${decodedCourseId}/home`],
    ['preview', `/learning/pr%65view/course/${decodedCourseId}/sequence`, `/learning/preview/course/${decodedCourseId}/sequence`],
    ['home', `/learning/course/${decodedCourseId}/h%6Fme`, `/learning/course/${decodedCourseId}/home`],
  ])('should decode an escaped character in the fixed segment %s', async (_segment, pathname, decodedPathname) => {
    const { router } = await renderAt(pathname);

    expect(router.state.location.pathname).toEqual(decodedPathname);
  });

  it('should leave a trailing slash as it is', async () => {
    const { navigate } = await renderAt(`/learning/course/${decodedCourseId}/home/`);

    expect(navigate).not.toHaveBeenCalled();
  });

  it('should not decode a url outside the course routes', async () => {
    const { navigate } = await renderAt('/learning/goal-unsubscribe/some%2Btoken');

    expect(navigate).not.toHaveBeenCalled();
    expect(sendPageEvent).not.toHaveBeenCalled();
  });

  it('should send one page event for each pathname of a course route', async () => {
    const { router } = await renderAt(`/learning/course/${encodedCourseId}/home`);
    expect(sendPageEvent).toHaveBeenCalledTimes(1);

    await act(() => router.navigate(`/learning/course/${decodedCourseId}/home?weekly_goal=3`));
    expect(sendPageEvent).toHaveBeenCalledTimes(1);

    await act(() => router.navigate(`/learning/course/${decodedCourseId}/dates`));
    expect(sendPageEvent).toHaveBeenCalledTimes(2);
  });
});

describe('decodeUrl', () => {
  expect(decodeUrl(decodedCourseId)).toEqual(decodedCourseId);
  expect(decodeUrl(encodedCourseId)).toEqual(decodedCourseId);
  expect(decodeUrl(deepEncodedCourseId)).toEqual(decodedCourseId);
});
