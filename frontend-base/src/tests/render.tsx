import {
  ErrorBoundary, getAuthenticatedUser, getSiteConfig, IntlProvider, type RoleRouteObject, SiteContext,
} from '@openedx/frontend-base';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router-dom';

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

export const renderRoutes = (routes: RoleRouteObject[], path: string) => {
  const queryClient = createTestQueryClient();
  const router = createMemoryRouter(routes, { initialEntries: [path] });
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
