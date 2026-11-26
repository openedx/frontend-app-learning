import React from 'react';
import { useLocation } from 'react-router-dom';

import { getAnalyticsService } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import routes from '@src/routes';
import { renderRoutes, replacePages } from '@src/tests/render';

const { sendTrackEvent } = getAnalyticsService();

describe('PathFixesProvider', () => {
  let testLocation;

  beforeAll(() => {
    Object.defineProperty(document, 'referrer', { value: 'https://example.com/foo' });
    testLocation = null;
    sendTrackEvent.mockClear();
  });

  async function buildAndRender(path) {
    const LocationComponent = () => {
      testLocation = useLocation();
      return <span data-testid="location" />;
    };

    renderRoutes(replacePages(routes, <LocationComponent />), path);
    await screen.findByTestId('location');
  }

  it('does not redirect for normal path', async () => {
    await buildAndRender('/learning/course/course-v1:org+course+run/home');
    expect(testLocation.pathname).toEqual('/learning/course/course-v1:org+course+run/home');
    expect(sendTrackEvent).toHaveBeenCalledTimes(0);
  });

  it('does redirect for path with spaces', async () => {
    await buildAndRender('/learning/course/course-v1:org course run/home');
    expect(testLocation.pathname).toEqual('/learning/course/course-v1:org+course+run/home');
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.path_fixed', {
      new_path: '/learning/course/course-v1:org+course+run/home',
      old_path: '/learning/course/course-v1:org course run/home',
      referrer: 'https://example.com/foo',
      search: '',
    });
  });

  it('does not change search part of URL', async () => {
    await buildAndRender('/learning/course/course-v1:org course run/home page?donuts=yes please');
    expect(testLocation.pathname).toEqual('/learning/course/course-v1:org+course+run/home+page');
    expect(testLocation.search).toEqual('?donuts=yes please');
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.path_fixed', {
      new_path: '/learning/course/course-v1:org+course+run/home+page',
      old_path: '/learning/course/course-v1:org course run/home page',
      referrer: 'https://example.com/foo',
      search: '?donuts=yes please',
    });
  });

  it('does redirect for an encoded space on a route outside the course routes', async () => {
    await buildAndRender('/learning/goal-unsubscribe/some%20token');
    expect(testLocation.pathname).toEqual('/learning/goal-unsubscribe/some+token');
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.path_fixed', {
      new_path: '/learning/goal-unsubscribe/some+token',
      old_path: '/learning/goal-unsubscribe/some%20token',
      referrer: 'https://example.com/foo',
      search: '',
    });
  });
});
