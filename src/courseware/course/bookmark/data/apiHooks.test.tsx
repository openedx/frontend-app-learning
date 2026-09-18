import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { createTestQueryClient, initializeMockApp } from '../../../../setupTest';
import initializeStore from '../../../../store';
import { useSetBookmarked } from './apiHooks';

const { loggingService } = initializeMockApp();

describe('bookmark apiHooks — useSetBookmarked', () => {
  const unitId = 'unitId';
  const createBookmarkURL = `${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/`;
  const deleteBookmarkURL = `${createBookmarkURL}${getAuthenticatedUser().username},${unitId}/`;

  let axiosMock: MockAdapter;
  let store: ReturnType<typeof initializeStore>;
  let queryClient: QueryClient;

  const unitModel = () => (
    store.getState().models as { units?: Record<string, { bookmarked?: boolean, bookmarkedUpdateState?: string }> }
  ).units?.[unitId];

  const renderSetBookmarked = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AppProvider>
    );
    return renderHook(() => useSetBookmarked(), { wrapper });
  };

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
    queryClient = createTestQueryClient(store);
    loggingService.logError.mockReset();
  });

  it('creates the bookmark and updates the model state', async () => {
    axiosMock.onPost(createBookmarkURL).reply(201);

    const { result } = renderSetBookmarked();
    act(() => { result.current(unitId, true); });

    await waitFor(() => expect(unitModel()).toEqual(expect.objectContaining({
      bookmarked: true,
      bookmarkedUpdateState: 'loaded',
    })));
    expect(axiosMock.history.post[0].url).toEqual(createBookmarkURL);
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ usage_id: unitId }));
  });

  it('logs the error and reverts the flag when creating the bookmark fails', async () => {
    axiosMock.onPost(createBookmarkURL).networkError();

    const { result } = renderSetBookmarked();
    act(() => { result.current(unitId, true); });

    await waitFor(() => expect(loggingService.logError).toHaveBeenCalled());
    expect(axiosMock.history.post[0].url).toEqual(createBookmarkURL);
    expect(unitModel()).toEqual(expect.objectContaining({
      bookmarked: false,
      bookmarkedUpdateState: 'failed',
    }));
  });

  it('deletes the bookmark and updates the model state', async () => {
    axiosMock.onDelete(deleteBookmarkURL).reply(201);

    const { result } = renderSetBookmarked();
    act(() => { result.current(unitId, false); });

    await waitFor(() => expect(unitModel()).toEqual(expect.objectContaining({
      bookmarked: false,
      bookmarkedUpdateState: 'loaded',
    })));
    expect(axiosMock.history.delete[0].url).toEqual(deleteBookmarkURL);
  });

  it('logs the error and reverts the flag when deleting the bookmark fails', async () => {
    axiosMock.onDelete(deleteBookmarkURL).networkError();

    const { result } = renderSetBookmarked();
    act(() => { result.current(unitId, false); });

    await waitFor(() => expect(loggingService.logError).toHaveBeenCalled());
    expect(axiosMock.history.delete[0].url).toEqual(deleteBookmarkURL);
    expect(unitModel()).toEqual(expect.objectContaining({
      bookmarked: true,
      bookmarkedUpdateState: 'failed',
    }));
  });

  it('flips the flag optimistically before the request resolves', async () => {
    let resolveCreate: () => void = () => {};
    axiosMock.onPost(createBookmarkURL).reply(() => new Promise((resolve) => {
      resolveCreate = () => resolve([201, {}]);
    }));

    const { result } = renderSetBookmarked();
    act(() => { result.current(unitId, true); });

    await waitFor(() => expect(unitModel()).toEqual(expect.objectContaining({
      bookmarked: true,
      bookmarkedUpdateState: 'loading',
    })));

    resolveCreate();
    await waitFor(() => expect(unitModel()).toEqual(expect.objectContaining({
      bookmarked: true,
      bookmarkedUpdateState: 'loaded',
    })));
  });
});
