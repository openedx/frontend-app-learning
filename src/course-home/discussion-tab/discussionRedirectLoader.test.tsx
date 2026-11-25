import { getSiteConfig, setSiteConfig } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import {
  isRouteErrorResponse, useLocation, useRouteError,
} from 'react-router-dom';

import { discussionsRole } from '@src/constants';
import routes from '@src/routes';
import { mockLocation } from '@src/tests/location';
import { renderRoutes } from '@src/tests/render';

const siteConfig = getSiteConfig();
const courseId = 'course-v1:edX+DemoX+Demo_Course';
const discussionPath = `/learning/course/${courseId}/discussion/topics/some+topic?sort=recent`;

const LandingProbe = () => {
  const { pathname, search } = useLocation();
  return <span data-testid="landing">{`${pathname}${search}`}</span>;
};
const RouteStatus = () => {
  const error = useRouteError();
  return <>{isRouteErrorResponse(error) ? `status=${error.status}` : 'not a route error response'}</>;
};

afterEach(() => {
  setSiteConfig(siteConfig);
});

describe('discussion redirect', () => {
  it('redirects to the external route the site declares for the discussions role', async () => {
    setSiteConfig({
      ...siteConfig,
      externalRoutes: [{ role: discussionsRole, url: 'http://localhost:2002/discussions/' }],
    });
    const location = mockLocation({ assign: jest.fn(), replace: jest.fn() });

    renderRoutes(routes, discussionPath);

    const expected = `http://localhost:2002/discussions/${courseId}/topics/some+topic?sort=recent`;
    await waitFor(() => expect(location.assign).toHaveBeenCalledWith(expected));
  });

  it('redirects to the route of the installed app that provides the discussions role', async () => {
    setSiteConfig({
      ...siteConfig,
      apps: [
        ...(siteConfig.apps ?? []),
        {
          appId: 'org.openedx.frontend.app.test.discussions',
          routes: [{ path: '/discussions', handle: { roles: [discussionsRole] } }],
        },
      ],
    });

    renderRoutes([...routes, { path: '/discussions/*', element: <LandingProbe /> }], discussionPath);

    expect(await screen.findByTestId('landing'))
      .toHaveTextContent(`/discussions/${courseId}/topics/some+topic?sort=recent`);
  });

  it('decodes an encoded course id and path before redirecting, as DecodePageRoute would', async () => {
    setSiteConfig({
      ...siteConfig,
      externalRoutes: [{ role: discussionsRole, url: 'http://localhost:2002/discussions' }],
    });
    const location = mockLocation({ assign: jest.fn(), replace: jest.fn() });
    const encodedCourseId = encodeURIComponent(encodeURIComponent(courseId));

    renderRoutes(routes, `/learning/course/${encodedCourseId}/discussion/${encodeURIComponent('some+topic')}`);

    await waitFor(() => expect(location.assign)
      .toHaveBeenCalledWith(`http://localhost:2002/discussions/${courseId}/some+topic`));
  });

  it('throws a 404 response when nothing provides the discussions role, which the shell renders as not found', async () => {
    renderRoutes([{ errorElement: <RouteStatus />, children: routes }], discussionPath);

    expect(await screen.findByText('status=404')).toBeInTheDocument();
  });
});
