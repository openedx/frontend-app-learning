import { ErrorBoundary, IntlProvider, type RoleRouteObject } from '@openedx/frontend-base';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router-dom';

import { ToastProvider } from '@src/generic/ToastContext';
import { UserMessagesProvider } from '@src/generic/user-messages';

import { createTestQueryClient } from './queryClient';

const Providers = ({ queryClient, children }: { queryClient: QueryClient; children: ReactNode }) => (
  <IntlProvider locale="en" messages={{}}>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserMessagesProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </UserMessagesProvider>
      </QueryClientProvider>
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
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </IntlProvider>,
    ),
    queryClient,
    router,
  };
};
