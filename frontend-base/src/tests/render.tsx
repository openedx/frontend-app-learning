import { IntlProvider, RoleRouteObject } from '@openedx/frontend-base';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

export const renderRoutes = (routes: RoleRouteObject[], path: string) => render(
  <IntlProvider locale="en" messages={{}}>
    <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
  </IntlProvider>,
);
