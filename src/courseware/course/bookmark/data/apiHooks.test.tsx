import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';

import type { SequenceMetadataData } from '@src/courseware/data/apiHooks';
import { coursewareQueryKeys } from '@src/courseware/data/queryKeys';
import { createTestQueryClient, initializeMockApp } from '../../../../setupTest';
import { useSetBookmarked } from './apiHooks';

const { loggingService } = initializeMockApp();

describe('bookmark apiHooks — useSetBookmarked', () => {
  const sequenceId = 'sequenceId';
  const unitId = 'unitId';
  const sequenceKey = coursewareQueryKeys.sequence(sequenceId, false);
  const createBookmarkURL = `${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/`;
  const deleteBookmarkURL = `${createBookmarkURL}${getAuthenticatedUser().username},${unitId}/`;

  let axiosMock: MockAdapter;
  let queryClient: QueryClient;

  const cachedUnit = () => (
    queryClient.getQueryData<SequenceMetadataData>(sequenceKey)?.units.find((unit) => unit.id === unitId)
  );

  const renderSetBookmarked = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[`/course/courseId/${sequenceId}/${unitId}`]}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MemoryRouter>
    );
    return renderHook(() => useSetBookmarked(), { wrapper });
  };

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    queryClient = createTestQueryClient();
    loggingService.logError.mockReset();
    queryClient.setQueryData(sequenceKey, { sequence: {}, units: [{ id: unitId, bookmarked: false }] });
  });

  it('creates the bookmark and updates the cached unit', async () => {
    axiosMock.onPost(createBookmarkURL).reply(201);

    const { result } = renderSetBookmarked();
    act(() => { result.current(sequenceId, unitId, true); });

    await waitFor(() => expect(cachedUnit()).toEqual(expect.objectContaining({
      bookmarked: true,
      bookmarkedUpdateState: 'loaded',
    })));
    expect(axiosMock.history.post[0].url).toEqual(createBookmarkURL);
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ usage_id: unitId }));
  });

  it('logs the error and reverts the flag when creating the bookmark fails', async () => {
    axiosMock.onPost(createBookmarkURL).networkError();

    const { result } = renderSetBookmarked();
    act(() => { result.current(sequenceId, unitId, true); });

    await waitFor(() => expect(loggingService.logError).toHaveBeenCalled());
    expect(axiosMock.history.post[0].url).toEqual(createBookmarkURL);
    expect(cachedUnit()).toEqual(expect.objectContaining({
      bookmarked: false,
      bookmarkedUpdateState: 'failed',
    }));
  });

  it('deletes the bookmark and updates the cached unit', async () => {
    axiosMock.onDelete(deleteBookmarkURL).reply(201);

    const { result } = renderSetBookmarked();
    act(() => { result.current(sequenceId, unitId, false); });

    await waitFor(() => expect(cachedUnit()).toEqual(expect.objectContaining({
      bookmarked: false,
      bookmarkedUpdateState: 'loaded',
    })));
    expect(axiosMock.history.delete[0].url).toEqual(deleteBookmarkURL);
  });

  it('logs the error and reverts the flag when deleting the bookmark fails', async () => {
    axiosMock.onDelete(deleteBookmarkURL).networkError();

    const { result } = renderSetBookmarked();
    act(() => { result.current(sequenceId, unitId, false); });

    await waitFor(() => expect(loggingService.logError).toHaveBeenCalled());
    expect(axiosMock.history.delete[0].url).toEqual(deleteBookmarkURL);
    expect(cachedUnit()).toEqual(expect.objectContaining({
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
    act(() => { result.current(sequenceId, unitId, true); });

    await waitFor(() => expect(cachedUnit()).toEqual(expect.objectContaining({
      bookmarked: true,
      bookmarkedUpdateState: 'loading',
    })));

    resolveCreate();
    await waitFor(() => expect(cachedUnit()).toEqual(expect.objectContaining({
      bookmarked: true,
      bookmarkedUpdateState: 'loaded',
    })));
  });

  it('writes nothing for a sequence that is not cached', async () => {
    axiosMock.onPost(createBookmarkURL).reply(201);
    const otherSequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@not_cached';

    const { result } = renderSetBookmarked();
    act(() => { result.current(otherSequenceId, unitId, true); });

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    await act(async () => {});
    expect(queryClient.getQueryData(coursewareQueryKeys.sequence(otherSequenceId, false))).toBeUndefined();
    expect(cachedUnit()).toEqual(expect.objectContaining({ bookmarked: false }));
  });
});
