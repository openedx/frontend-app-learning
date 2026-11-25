import { screen } from '@testing-library/react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import routes from '@src/routes';
import { renderRoutes } from '@src/tests/render';

const courseId = 'course-v1:OpenedX+DemoX+DemoCourse';

const RouteStatus = () => {
  const error = useRouteError();
  return <>{isRouteErrorResponse(error) ? `status=${error.status}` : 'not a route error response'}</>;
};

describe('routes', () => {
  it("throws a 404 response at Learning's root, which the shell renders as not found", async () => {
    renderRoutes([{ errorElement: <RouteStatus />, children: routes }], '/learning');
    expect(await screen.findByText('status=404')).toBeInTheDocument();
  });

  describe('courseware', () => {
    it('throws a 404 response at preview/course/:courseId, which the shell renders as not found', async () => {
      renderRoutes([{ errorElement: <RouteStatus />, children: routes }], `/learning/preview/course/${courseId}`);
      expect(await screen.findByText('status=404')).toBeInTheDocument();
    });
  });
});
