import {
  CurrentAppProvider, ErrorBoundary, getAuthenticatedUser, getSiteConfig, IntlProvider, type RoleRouteObject, SiteContext,
} from '@openedx/frontend-base';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import {
  createBrowserRouter, createMemoryRouter, MemoryRouter, RouterProvider,
} from 'react-router-dom';

import { appId } from '@src/constants';
import { type CourseParams, CourseParamsProvider } from '@src/generic/course-params';
import { ToastProvider } from '@src/generic/ToastContext';
import { UserMessagesProvider } from '@src/generic/user-messages';

import { createTestQueryClient } from './queryClient';

/*
 * The shell's SiteProvider supplies this context, whose default holds no authenticated user. Inside it, it mounts
 * every app's `providers`, first app outermost, as its (unexported) CombinedAppProvider does.
 */
const SiteContextProvider = ({ children }: { children: ReactNode }) => {
  const siteConfig = getSiteConfig();
  const providers = (siteConfig.apps ?? []).flatMap(app => app.providers ?? []);
  return (
    <SiteContext.Provider value={{ authenticatedUser: getAuthenticatedUser(), siteConfig, locale: 'en' }}>
      {providers.reduceRight<ReactNode>((acc, Provider) => <Provider>{acc}</Provider>, children)}
    </SiteContext.Provider>
  );
};

// Learning's Main mounts CurrentAppProvider; a component rendered on its own gets it here.
const Providers = ({ queryClient, children }: { queryClient: QueryClient; children: ReactNode }) => (
  <IntlProvider locale="en" messages={{}}>
    <ErrorBoundary>
      <SiteContextProvider>
        <CurrentAppProvider appId={appId}>
          <QueryClientProvider client={queryClient}>
            <UserMessagesProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </UserMessagesProvider>
          </QueryClientProvider>
        </CurrentAppProvider>
      </SiteContextProvider>
    </ErrorBoundary>
  </IntlProvider>
);

interface Options extends RenderOptions {
  wrapWithRouter?: boolean;
  // The params a tab root would provide, for a component that reads them (useCourseId and the rest).
  courseParams?: CourseParams;
}

export const render = (ui: ReactElement, { wrapWithRouter = false, courseParams, ...options }: Options = {}) => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const content = courseParams ? <CourseParamsProvider {...courseParams}>{children}</CourseParamsProvider> : children;
    return (
      <Providers queryClient={queryClient}>
        {wrapWithRouter ? <MemoryRouter>{content}</MemoryRouter> : content}
      </Providers>
    );
  };
  return rtlRender(ui, { wrapper: Wrapper, ...options });
};

// Where renderStandalone's router sits: not one of Learning's paths, as on another app's page.
export const standalonePath = '/some-other-app/page';

/*
 * Renders `ui` as a widget would be on another app's page: only the shell's providers (intl, the site context, a query
 * client), none of Learning's (no CurrentAppProvider, user messages or toast), and a router at `standalonePath`.
 */
export const renderStandalone = (ui: ReactElement, options: RenderOptions = {}) => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider locale="en" messages={{}}>
      <SiteContextProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[standalonePath]}>
            {children}
          </MemoryRouter>
        </QueryClientProvider>
      </SiteContextProvider>
    </IntlProvider>
  );
  return { ...rtlRender(ui, { wrapper: Wrapper, ...options }), queryClient };
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
