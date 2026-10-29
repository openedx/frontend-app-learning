import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { getLoggingService, IntlProvider, MockLoggingService } from '@openedx/frontend-base';
import { QueryClientProvider } from '@tanstack/react-query';
import { appId } from './constants';
import Main from './Main';
import { createTestQueryClient } from './tests/queryClient';

const renderMain = () => {
  const queryClient = createTestQueryClient();
  render(
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </QueryClientProvider>
    </IntlProvider>
  );
  return queryClient;
};

describe('Main', () => {
  it('sets the document title from the page-title message and site name', async () => {
    renderMain();
    await waitFor(() => {
      expect(document.title).toBe('Learning | Learning Test Site');
    });
  });

  it('logs a failed Learning query while mounted', async () => {
    const queryClient = renderMain();
    const error = new Error('boom');
    await queryClient.fetchQuery({
      queryKey: [appId, 'failing'],
      queryFn: () => Promise.reject(error),
    }).catch(() => {});

    expect((getLoggingService() as MockLoggingService).logError).toHaveBeenCalledWith(error, undefined);
  });
});
