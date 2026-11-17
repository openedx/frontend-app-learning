import {
  ErrorBoundary, getAuthenticatedUser, getSiteConfig, IntlProvider, type RoleRouteObject, SiteContext,
} from '@openedx/frontend-base';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import {
  createBrowserRouter, createMemoryRouter, MemoryRouter, RouterProvider,
} from 'react-router-dom';

import { ToastProvider } from '@src/generic/ToastContext';
import { UserMessagesProvider } from '@src/generic/user-messages';

import { createTestQueryClient } from './queryClient';

// The shell's SiteProvider supplies this context; its default holds no authenticated user.
const SiteContextProvider = ({ children }: { children: ReactNode }) => (
  <SiteContext.Provider value={{ authenticatedUser: getAuthenticatedUser(), siteConfig: getSiteConfig(), locale: 'en' }}>
    {children}
  </SiteContext.Provider>
);

const Providers = ({ queryClient, children }: { queryClient: QueryClient; children: ReactNode }) => (
  <IntlProvider locale="en" messages={{}}>
    <ErrorBoundary>
      <SiteContextProvider>
        <QueryClientProvider client={queryClient}>
          <UserMessagesProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </UserMessagesProvider>
        </QueryClientProvider>
      </SiteContextProvider>
    </ErrorBoundary>
  </IntlProvider>
);

interface Options extends RenderOptions {
  wrapWithRouter?: boolean;
}

export const render = (ui: ReactElement, { wrapWithRouter = false, ...options }: Options = {}) => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Providers queryClient={queryClient}>
      {wrapWithRouter ? <MemoryRouter>{children}</MemoryRouter> : children}
    </Providers>
  );
  return rtlRender(ui, { wrapper: Wrapper, ...options });
};

const renderRouter = (router: ReturnType<typeof createMemoryRouter>) => {
  const queryClient = createTestQueryClient();
  return {
    ...rtlRender(
      <IntlProvider locale="en" messages={{}}>
        <SiteContextProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </SiteContextProvider>
      </IntlProvider>,
    ),
    queryClient,
    router,
  };
};

export const renderRoutes = (routes: RoleRouteObject[], path: string) => (
  renderRouter(createMemoryRouter(routes, { initialEntries: [path] }))
);

// Renders at the browser's own address, for a suite that asserts on it; a test sets the address before rendering.
export const renderBrowserRoutes = (routes: RoleRouteObject[]) => renderRouter(createBrowserRouter(routes));

// The route array with each page replaced by `page`, so a test renders the real layout routes and no page's requests.
export const replacePages = (routes: RoleRouteObject[], page: ReactNode): RoleRouteObject[] => routes.map((route) => {
  // A route with children is a layout: it stays, and the pages under it are replaced.
  if (route.children) {
    return { ...route, children: replacePages(route.children, page) };
  }
  return { ...route, lazy: undefined, loader: undefined, element: page };
});
