import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { MemoryRouter } from 'react-router-dom';

import { appendBrowserTimezoneToUrl } from '../../utils';
import { buildSimpleCourseBlocks } from '../../shared/data/__factories__/courseBlocks.factory';
import { buildOutlineFromBlocks } from './__factories__/learningSequencesOutline.factory';
import { getResponseStatus } from '../../data/http-error';
import { createTestQueryClient, initializeMockApp, seedSequenceModels } from '../../setupTest';
import initializeStore from '../../store';
import { addModel, updateModel } from '../../generic/model-store';
import { normalizeLearningSequencesData, normalizeOutlineBlocks, normalizeSequenceMetadata } from './utils';
import { coursewareQueryKeys } from './queryKeys';
import { courseHomeQueryKeys } from '../../course-home/data/queryKeys';
import type { CourseOutlineData } from './courseOutline';
import { useCourseHomeMeta } from '../../course-home/data/apiHooks';
import {
  prefetchDiscussionTopics, sequenceMightBeUnit, useCheckBlockCompletion, useCourseOutlineStructure,
  useCoursewareMetadata, useCoursewareOutline, useCoursewareOutlineSidebarToggles, useIsCourseLoaded,
  useSaveIntegritySignature, useSaveSequencePosition, useSequenceIds, useSequenceMetadata,
} from './apiHooks';

const { loggingService } = initializeMockApp();

describe('courseware apiHooks — coursewareMeta bridge', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseHomeMetadata = Factory.build('courseHomeMetadata');
  const courseId = courseMetadata.id;
  const { courseBlocks } = buildSimpleCourseBlocks(courseId);
  const outlineResponse = buildOutlineFromBlocks(courseBlocks);
  const normalizedOutline = normalizeLearningSequencesData(outlineResponse);
  const expectedSectionIds = normalizedOutline.courses[courseId].sectionIds;
  const expectedSequenceIds = expectedSectionIds.flatMap(
    (id: string) => normalizedOutline.sections[id].sequenceIds,
  );

  let axiosMock: MockAdapter;
  let store: ReturnType<typeof initializeStore>;
  const outlineUrl = `${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/${courseId}`;
  const metadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`);
  const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(
    `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`,
  );

  const coursewareMetaFor = (id: string) => (
    store.getState().models as { coursewareMeta?: Record<string, { sectionIds?: string[]; title?: string }> }
  ).coursewareMeta?.[id];

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
  });

  it('keeps coursewareMeta.sectionIds (and the sequence order nav needs) when metadata resolves after the outline', async () => {
    let resolveMetadata: () => void = () => {};
    axiosMock.onGet(outlineUrl).reply(200, outlineResponse);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);
    axiosMock.onGet(metadataUrl).reply(() => new Promise((resolve) => {
      resolveMetadata = () => resolve([200, courseMetadata]);
    }));

    const queryClient = createTestQueryClient(store);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AppProvider>
    );
    const { result } = renderHook(() => {
      useCoursewareMetadata(courseId);
      useCoursewareOutline(courseId);
      useCourseHomeMeta(courseId);
      return useSequenceIds(courseId);
    }, { wrapper });

    // The outline resolves first and populates sectionIds; the loaded gate still
    // waits on metadata, so no ids yet.
    await waitFor(() => expect(coursewareMetaFor(courseId)?.sectionIds).toEqual(expectedSectionIds));
    expect(result.current).toEqual([]);

    // Now let the metadata mirror land last.
    resolveMetadata();
    await waitFor(() => expect(result.current).toEqual(expectedSequenceIds));

    // sectionIds must survive the late metadata write.
    expect(coursewareMetaFor(courseId)?.title).toBe(courseMetadata.name);
    expect(coursewareMetaFor(courseId)?.sectionIds).toEqual(expectedSectionIds);
  });

  it('fetches nothing on its own', () => {
    axiosMock.onGet(outlineUrl).reply(200, outlineResponse);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);
    axiosMock.onGet(metadataUrl).reply(200, courseMetadata);
    const queryClient = createTestQueryClient(store);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AppProvider>
    );
    const { result } = renderHook(() => useSequenceIds(courseId), { wrapper });

    expect(result.current).toEqual([]);
    expect(axiosMock.history.get).toHaveLength(0);
  });
});

describe('courseware apiHooks — useIsCourseLoaded', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const { courseBlocks } = buildSimpleCourseBlocks(courseId);
  const outlineResponse = buildOutlineFromBlocks(courseBlocks);

  let axiosMock: MockAdapter;
  const outlineUrl = `${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/${courseId}`;
  const metadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`);
  const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(
    `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`,
  );

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  const mockHappyPath = () => {
    axiosMock.onGet(outlineUrl).reply(200, outlineResponse);
    axiosMock.onGet(metadataUrl).reply(200, courseMetadata);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, Factory.build('courseHomeMetadata'));
  };

  const makeWrapper = (client: QueryClient) => function Wrapper(
    { children }: { children: ReactNode },
  ) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

  const renderLoaded = (id: string | undefined, queryClient: QueryClient = createTestQueryClient()) => (
    renderHook(() => {
      useCoursewareMetadata(id);
      useCoursewareOutline(id);
      useCourseHomeMeta(id);
      return useIsCourseLoaded(id);
    }, { wrapper: makeWrapper(queryClient) })
  );

  const statusOf = (queryClient: QueryClient, queryKey: readonly unknown[]) => (
    queryClient.getQueryState(queryKey)?.status
  );

  it('is true once all three queries resolve and the learner has access', async () => {
    mockHappyPath();
    const { result } = renderLoaded(courseId);
    expect(result.current).toBe(false); // pending
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('is false while any query is pending', async () => {
    mockHappyPath();
    axiosMock.onGet(metadataUrl).reply(() => new Promise(() => {}));
    const queryClient = createTestQueryClient();
    const { result } = renderLoaded(courseId, queryClient);

    await waitFor(() => {
      expect(statusOf(queryClient, coursewareQueryKeys.outline(courseId))).toBe('success');
      expect(statusOf(queryClient, courseHomeQueryKeys.metadata(courseId))).toBe('success');
    });
    expect(statusOf(queryClient, coursewareQueryKeys.metadata(courseId))).toBe('pending');
    expect(result.current).toBe(false);
  });

  it('is false when the learner lacks access', async () => {
    mockHappyPath();
    axiosMock.onGet(courseHomeMetadataUrl).reply(
      200,
      Factory.build('courseHomeMetadata', { course_access: { has_access: false } }),
    );
    const queryClient = createTestQueryClient();
    const { result } = renderLoaded(courseId, queryClient);

    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(queryClient.getQueryData<{ courseAccess: { hasAccess: boolean } }>(
      courseHomeQueryKeys.metadata(courseId),
    )?.courseAccess.hasAccess).toBe(false);
    expect(result.current).toBe(false);
  });

  it('is false when the outline fails', async () => {
    mockHappyPath();
    axiosMock.onGet(outlineUrl).reply(403, {});
    const queryClient = createTestQueryClient();
    const { result } = renderLoaded(courseId, queryClient);

    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(statusOf(queryClient, coursewareQueryKeys.outline(courseId))).toBe('error');
    expect(result.current).toBe(false);
  });

  it('is false when a query fails', async () => {
    mockHappyPath();
    axiosMock.onGet(metadataUrl).reply(500, {});
    const queryClient = createTestQueryClient();
    const { result } = renderLoaded(courseId, queryClient);

    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(statusOf(queryClient, coursewareQueryKeys.metadata(courseId))).toBe('error');
    expect(result.current).toBe(false);
  });

  it('is false without a courseId, without fetching', () => {
    const { result } = renderLoaded(undefined);
    expect(result.current).toBe(false);
    expect(axiosMock.history.get).toHaveLength(0);
  });

  it('fetches nothing on its own', () => {
    mockHappyPath();
    const { result } = renderHook(() => useIsCourseLoaded(courseId), { wrapper: makeWrapper(createTestQueryClient()) });
    expect(result.current).toBe(false);
    expect(axiosMock.history.get).toHaveLength(0);
  });

  it('reads the owner\'s result without fetching again', async () => {
    mockHappyPath();
    const queryClient = createTestQueryClient();
    const owner = renderLoaded(courseId, queryClient);
    await waitFor(() => expect(owner.result.current).toBe(true));
    const requestCount = axiosMock.history.get.length;

    const reader = renderHook(() => useIsCourseLoaded(courseId), { wrapper: makeWrapper(queryClient) });

    expect(reader.result.current).toBe(true);
    expect(axiosMock.history.get).toHaveLength(requestCount);
  });
});

describe('courseware apiHooks — useSequenceMetadata', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const { unitBlocks, sequenceBlocks } = buildSimpleCourseBlocks(courseId);
  const sequenceMetadata = Factory.build(
    'sequenceMetadata',
    {},
    { courseId, unitBlocks, sequenceBlock: sequenceBlocks[0] },
  );
  const sequenceId = sequenceBlocks[0].id;
  const { sequence: normalizedSequence, units: normalizedUnits } = normalizeSequenceMetadata(sequenceMetadata);
  const sequenceUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceMetadata.item_id}`;

  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  const makeWrapper = (client: QueryClient, pathname: string) => function Wrapper(
    { children }: { children: ReactNode },
  ) {
    return (
      <MemoryRouter initialEntries={[pathname]}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </MemoryRouter>
    );
  };

  const renderSequence = (
    client: QueryClient = createTestQueryClient(),
    pathname = `/course/${courseId}/${sequenceId}`,
  ) => renderHook(() => useSequenceMetadata(sequenceId), { wrapper: makeWrapper(client, pathname) });

  it('fetches and normalizes the sequence and its units', async () => {
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);

    const { result } = renderSequence(createTestQueryClient());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ sequence: normalizedSequence, units: normalizedUnits });
  });

  it('throws for a non-sequential block type', async () => {
    axiosMock.onGet(sequenceUrl).reply(200, { ...sequenceMetadata, tag: 'chapter' });

    const { result } = renderSequence(createTestQueryClient());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("expected block type 'sequential'");
  });

  it('surfaces a 422 as an error (the container reads this as sequenceMightBeUnit)', async () => {
    axiosMock.onGet(sequenceUrl).reply(422, {});

    const { result } = renderSequence(createTestQueryClient());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getResponseStatus(result.current.error)).toBe(422);
  });

  it('does not retry, even under a retrying client (keeps 422 unit detection fast)', async () => {
    axiosMock.onGet(sequenceUrl).reply(422, {});
    const retryingClient = new QueryClient({
      defaultOptions: { queries: { retry: 3, retryDelay: 0 } },
    });

    const { result } = renderSequence(retryingClient);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(axiosMock.history.get.filter(req => req.url === sequenceUrl)).toHaveLength(1);
  });

  it('stays pending without a sequenceId, without fetching', () => {
    const { result } = renderHook(
      () => useSequenceMetadata(undefined),
      { wrapper: makeWrapper(createTestQueryClient(), `/course/${courseId}`) },
    );
    expect(result.current.isPending).toBe(true);
    expect(axiosMock.history.get).toHaveLength(0);
  });

  it('requests preview metadata on a preview route', async () => {
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
    const { result } = renderSequence(createTestQueryClient(), `/preview/course/${courseId}/${sequenceId}`);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(axiosMock.history.get[0].params).toEqual({ preview: '1' });
  });

  describe('sequenceMightBeUnit', () => {
    it('is true for a 422 failure', async () => {
      axiosMock.onGet(sequenceUrl).reply(422, {});
      const { result } = renderSequence();
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(sequenceMightBeUnit(result.current)).toBe(true);
    });

    it('is false for a non-422 failure', async () => {
      axiosMock.onGet(sequenceUrl).reply(500, {});
      const { result } = renderSequence();
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(sequenceMightBeUnit(result.current)).toBe(false);
    });

    it('is false while pending and after success', async () => {
      axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
      const { result } = renderSequence();
      expect(sequenceMightBeUnit(result.current)).toBe(false);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(sequenceMightBeUnit(result.current)).toBe(false);
    });
  });
});

describe('courseware apiHooks — useCourseOutlineStructure', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const { courseBlocks } = buildSimpleCourseBlocks(courseId);
  const navigationUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/navigation/${courseId}`;

  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  const renderOutline = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
    );
    return renderHook(() => useCourseOutlineStructure(courseId), { wrapper });
  };

  it('fetches and normalizes the sidebar outline', async () => {
    axiosMock.onGet(navigationUrl).reply(200, { blocks: courseBlocks.blocks });

    const { result } = renderOutline();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(normalizeOutlineBlocks(courseId, courseBlocks.blocks));
  });

  it('returns null when the response has no blocks', async () => {
    axiosMock.onGet(navigationUrl).reply(200, {});

    const { result } = renderOutline();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('courseware apiHooks — useCoursewareOutlineSidebarToggles', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const togglesUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/courseware-navigation-sidebar/toggles/`;

  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    loggingService.logError.mockReset();
  });

  const renderToggles = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={createTestQueryClient(initializeStore())}>{children}</QueryClientProvider>
    );
    return renderHook(() => useCoursewareOutlineSidebarToggles(courseId), { wrapper });
  };

  it('returns the camelCased completion-tracking flag', async () => {
    axiosMock.onGet(togglesUrl).reply(200, { enable_completion_tracking: true });

    const { result } = renderToggles();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ enableCompletionTracking: true });
  });

  it('logs the error and leaves the flag unset on failure', async () => {
    axiosMock.onGet(togglesUrl).networkError();

    const { result } = renderToggles();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(loggingService.logError).toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});

describe('courseware apiHooks — prefetchDiscussionTopics', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const configUrl = `${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`;
  const topicsUrl = `${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`;

  let axiosMock: MockAdapter;
  let store: ReturnType<typeof initializeStore>;

  const discussionTopicModels = () => (
    store.getState().models as { discussionTopics?: Record<string, { id: string }> }
  ).discussionTopics;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
    loggingService.logError.mockReset();
  });

  it('loads openedx-provider topics into the discussionTopics model, keyed by usage key', async () => {
    axiosMock.onGet(configUrl).reply(200, { provider: 'openedx' });
    axiosMock.onGet(topicsUrl).reply(200, [
      { id: 'topic-1', usage_key: 'unit-1', enabled_in_context: true },
      { id: 'course-wide-topic', usage_key: null, enabled_in_context: true },
    ]);

    await prefetchDiscussionTopics(createTestQueryClient(store), courseId);

    expect(discussionTopicModels()).toEqual({
      'unit-1': { id: 'topic-1', usageKey: 'unit-1', enabledInContext: true },
      // the course-wide topic has no usage key, so it is dropped
    });
  });

  it('skips the topics request entirely for a legacy provider', async () => {
    axiosMock.onGet(configUrl).reply(200, { provider: 'legacy' });

    await prefetchDiscussionTopics(createTestQueryClient(store), courseId);

    expect(axiosMock.history.get.map(request => request.url)).toEqual([configUrl]);
    expect(discussionTopicModels()).toBeUndefined();
  });

  it('logs the error and writes nothing when the config request fails', async () => {
    axiosMock.onGet(configUrl).networkError();

    await prefetchDiscussionTopics(createTestQueryClient(store), courseId);

    expect(loggingService.logError).toHaveBeenCalled();
    expect(discussionTopicModels()).toBeUndefined();
  });
});

describe('courseware apiHooks — useCheckBlockCompletion', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const { courseBlocks, unitBlocks, sequenceBlocks } = buildSimpleCourseBlocks(courseId);
  const sequenceMetadata = Factory.build(
    'sequenceMetadata',
    {},
    { courseId, unitBlocks, sequenceBlock: sequenceBlocks[0] },
  );
  const sequenceId = sequenceBlocks[0].id;
  const unitId = unitBlocks[0].id;
  const sequenceUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceMetadata.item_id}`;
  const completionUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler/get_completion`;
  const outlineQueryKey = coursewareQueryKeys.courseOutline(courseId);

  let axiosMock: MockAdapter;
  let store: ReturnType<typeof initializeStore>;
  let queryClient: QueryClient;

  const outline = () => queryClient.getQueryData<CourseOutlineData>(outlineQueryKey)!;
  const unitModels = () => (store.getState().models as { units?: Record<string, { complete?: boolean }> }).units;

  const seedOutline = () => {
    queryClient.setQueryData(outlineQueryKey, normalizeOutlineBlocks(courseId, courseBlocks.blocks));
  };

  const renderCheckBlockCompletion = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AppProvider>
    );
    return renderHook(() => useCheckBlockCompletion(), { wrapper });
  };

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
    queryClient = createTestQueryClient(store);
    loggingService.logError.mockReset();
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
    await seedSequenceModels(store, [sequenceMetadata.item_id]);
  });

  it('marks the unit complete in the units model and rolls the outline up', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: true });
    seedOutline();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const [unit] = Object.values(outline().units);
    const [sequence] = Object.values(outline().sequences);
    const [section] = Object.values(outline().sections);
    expect(unit.complete).not.toBeTruthy();
    expect(sequence.complete).not.toBeTruthy();
    expect(section.complete).not.toBeTruthy();

    const { result } = renderCheckBlockCompletion();
    act(() => { result.current(courseId, sequenceId, unit.id); });

    await waitFor(() => expect(unitModels()?.[unit.id]?.complete).toBe(true));
    expect(outline().units[unit.id].complete).toBe(true);
    expect(outline().sequences[sequence.id].complete).toBe(true);
    expect(outline().sections[section.id].complete).toBe(true);
    // No locked sequence in the section, so no refetch is triggered.
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('writes complete: false to the units model and leaves the outline untouched', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: false });
    seedOutline();

    const [unit] = Object.values(outline().units);
    const [sequence] = Object.values(outline().sequences);
    const [section] = Object.values(outline().sections);

    const { result } = renderCheckBlockCompletion();
    act(() => { result.current(courseId, sequenceId, unit.id); });

    await waitFor(() => expect(unitModels()?.[unit.id]?.complete).toBe(false));
    expect(outline().units[unit.id].complete).not.toBeTruthy();
    expect(outline().sequences[sequence.id].complete).not.toBeTruthy();
    expect(outline().sections[section.id].complete).not.toBeTruthy();
  });

  it('logs the error and writes nothing when the completion request fails', async () => {
    axiosMock.onPost(completionUrl).networkError();

    const { result } = renderCheckBlockCompletion();
    act(() => { result.current(courseId, sequenceId, unitId); });

    await waitFor(() => expect(loggingService.logError).toHaveBeenCalledTimes(1));
    expect(axiosMock.history.post[0].url).toEqual(completionUrl);
    expect(unitModels()?.[unitId]?.complete).not.toBe(true);
  });

  it('skips the request entirely when the unit is already complete', async () => {
    store.dispatch(updateModel({ modelType: 'units', model: { id: unitId, complete: true } }));

    const { result } = renderCheckBlockCompletion();
    await act(async () => { result.current(courseId, sequenceId, unitId); });

    expect(axiosMock.history.post).toHaveLength(0);
  });

  it('proceeds to the request when no unit model has been written yet', async () => {
    store = initializeStore();
    axiosMock.onPost(completionUrl).reply(201, { complete: true });

    const { result } = renderCheckBlockCompletion();
    act(() => { result.current(courseId, sequenceId, unitId); });

    await waitFor(() => expect(unitModels()?.[unitId]?.complete).toBe(true));
  });

  it('still writes completion when the caller unmounts before the response arrives', async () => {
    // The sidebar unmounts routinely with the POST in flight (mobile collapse, unit
    // navigation); the writes live in the hook-level onSuccess, which runs regardless.
    let resolveCompletion: () => void = () => {};
    axiosMock.onPost(completionUrl).reply(() => new Promise((resolve) => {
      resolveCompletion = () => resolve([201, { complete: true }]);
    }));
    seedOutline();

    const [unit] = Object.values(outline().units);

    const { result, unmount } = renderCheckBlockCompletion();
    act(() => { result.current(courseId, sequenceId, unit.id); });
    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));

    unmount();
    resolveCompletion();

    await waitFor(() => expect(unitModels()?.[unit.id]?.complete).toBe(true));
    expect(outline().units[unit.id].complete).toBe(true);
  });

  it('still marks the unit complete, quietly, when the outline was never cached', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: true });

    const { result } = renderCheckBlockCompletion();
    act(() => { result.current(courseId, sequenceId, unitId); });

    await waitFor(() => expect(unitModels()?.[unitId]?.complete).toBe(true));
    expect(loggingService.logError).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(outlineQueryKey)).toBeUndefined();
  });

  it('leaves the outline untouched when the cached tree does not contain the unit', async () => {
    // The old reducer threw on an unknown unit and immer discarded the draft, leaving the
    // outline unmodified; the helper's not-found guard reproduces that outcome.
    axiosMock.onPost(completionUrl).reply(201, { complete: true });
    seedOutline();
    const foreignUnitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@not_in_this_outline';
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderCheckBlockCompletion();
    act(() => { result.current(courseId, sequenceId, foreignUnitId); });

    await waitFor(() => expect(unitModels()?.[foreignUnitId]?.complete).toBe(true));
    expect(outline()).toEqual(normalizeOutlineBlocks(courseId, courseBlocks.blocks));
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(loggingService.logError).not.toHaveBeenCalled();
  });

  it('invalidates the outline query when completing a sequence in a section with a locked sequence', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: true });
    const lockedOutline: CourseOutlineData = {
      units: {
        'unit-1': {
          id: 'unit-1', complete: false, title: 'Unit 1', type: 'vertical',
        },
      },
      sequences: {
        'seq-1': {
          id: 'seq-1',
          complete: false,
          title: 'Sequence 1',
          type: 'sequential',
          unitIds: ['unit-1'],
          completionStat: { completed: 0, total: 1 },
        },
        'seq-locked': {
          id: 'seq-locked',
          complete: false,
          title: 'Locked prerequisite sequence',
          type: 'lock',
          unitIds: [],
          completionStat: { completed: 0, total: 0 },
        },
      },
      sections: {
        'section-1': {
          id: 'section-1',
          complete: false,
          title: 'Section 1',
          sequenceIds: ['seq-1', 'seq-locked'],
          completionStat: { completed: 0, total: 1 },
        },
      },
    };
    queryClient.setQueryData(outlineQueryKey, lockedOutline);
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderCheckBlockCompletion();
    act(() => { result.current(courseId, sequenceId, 'unit-1'); });

    await waitFor(() => expect(unitModels()?.['unit-1']?.complete).toBe(true));
    expect(outline().units['unit-1'].complete).toBe(true);
    expect(outline().sequences['seq-1'].complete).toBe(true);
    expect(outline().sequences['seq-1'].completionStat.completed).toBe(1);
    // The locked sequence keeps its section incomplete; the refetch will reveal it unlocked.
    expect(outline().sections['section-1'].complete).toBe(false);
    expect(outline().sections['section-1'].completionStat.completed).toBe(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: outlineQueryKey });
  });
});

describe('courseware apiHooks — useSaveSequencePosition', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const { unitBlocks, sequenceBlocks } = buildSimpleCourseBlocks(courseId);
  const sequenceMetadata = Factory.build(
    'sequenceMetadata',
    {},
    { courseId, unitBlocks, sequenceBlock: sequenceBlocks[0] },
  );
  const sequenceId = sequenceBlocks[0].id;
  const sequenceUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceMetadata.item_id}`;
  const gotoPositionUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler/goto_position`;

  let axiosMock: MockAdapter;
  let store: ReturnType<typeof initializeStore>;
  let queryClient: QueryClient;

  const activeUnitIndex = () => (
    store.getState().models as { sequences: Record<string, { activeUnitIndex: number }> }
  ).sequences[sequenceId].activeUnitIndex;

  const renderSaveSequencePosition = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AppProvider>
    );
    return renderHook(() => useSaveSequencePosition(), { wrapper });
  };

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
    queryClient = createTestQueryClient(store);
    loggingService.logError.mockReset();
    // The rollback pre-read needs the sequence model loaded, which callers always
    // have (the save only fires from a rendered sequence).
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
    await seedSequenceModels(store, [sequenceMetadata.item_id]);
  });

  it('updates the sequence model activeUnitIndex and posts the 1-indexed position', async () => {
    axiosMock.onPost(gotoPositionUrl).reply(201, {});
    const newPosition = 123;

    const { result } = renderSaveSequencePosition();
    act(() => { result.current(courseId, sequenceId, newPosition); });

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(axiosMock.history.post[0].url).toEqual(gotoPositionUrl);
    // Position is 1-indexed on the server and 0-indexed in this app.
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ position: newPosition + 1 });
    expect(activeUnitIndex()).toEqual(newPosition);
  });

  it('changes and reverts the sequence model activeUnitIndex in case of error', async () => {
    axiosMock.onPost(gotoPositionUrl).networkError();
    const oldPosition = activeUnitIndex();
    const newPosition = 123;

    const { result } = renderSaveSequencePosition();
    act(() => { result.current(courseId, sequenceId, newPosition); });

    await waitFor(() => expect(loggingService.logError).toHaveBeenCalledTimes(1));
    expect(axiosMock.history.post[0].url).toEqual(gotoPositionUrl);
    expect(activeUnitIndex()).toEqual(oldPosition);
  });

  it('applies the optimistic position before the request resolves', async () => {
    let resolvePost: () => void = () => {};
    axiosMock.onPost(gotoPositionUrl).reply(() => new Promise((resolve) => {
      resolvePost = () => resolve([201, {}]);
    }));
    const newPosition = 123;

    const { result } = renderSaveSequencePosition();
    act(() => { result.current(courseId, sequenceId, newPosition); });

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(activeUnitIndex()).toEqual(newPosition);

    await act(async () => { resolvePost(); });
    expect(activeUnitIndex()).toEqual(newPosition);
  });
});

describe('courseware apiHooks — useSaveIntegritySignature', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const integritySignatureUrl = `${getConfig().LMS_BASE_URL}/api/agreements/v1/integrity_signature/${courseId}`;

  let axiosMock: MockAdapter;
  let store: ReturnType<typeof initializeStore>;
  let queryClient: QueryClient;

  const needsSignature = () => (
    store.getState().models as { coursewareMeta: Record<string, { userNeedsIntegritySignature?: boolean }> }
  ).coursewareMeta[courseId].userNeedsIntegritySignature;

  const renderSaveIntegritySignature = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppProvider store={store} wrapWithRouter={false}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AppProvider>
    );
    return renderHook(() => useSaveIntegritySignature(), { wrapper });
  };

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
    queryClient = createTestQueryClient(store);
    loggingService.logError.mockReset();
    // Seed the normalized model directly; the user_needs_integrity_signature
    // normalization itself is covered by the metadata query and pact tests.
    store.dispatch(addModel({
      modelType: 'coursewareMeta',
      model: { id: courseId, userNeedsIntegritySignature: true },
    }));
  });

  it('updates userNeedsIntegritySignature upon success', async () => {
    axiosMock.onPost(integritySignatureUrl).reply(200, {});

    const { result } = renderSaveIntegritySignature();
    act(() => { result.current(courseId, false); });

    await waitFor(() => expect(needsSignature()).toEqual(false));
    expect(axiosMock.history.post[0].url).toEqual(integritySignatureUrl);
  });

  it('dismisses the prompt without a request when masquerading as a specific learner', async () => {
    const { result } = renderSaveIntegritySignature();
    act(() => { result.current(courseId, true); });

    await waitFor(() => expect(needsSignature()).toEqual(false));
    expect(axiosMock.history.post).toHaveLength(0);
  });

  it('logs the error and leaves the prompt in place when the request fails', async () => {
    axiosMock.onPost(integritySignatureUrl).networkError();

    const { result } = renderSaveIntegritySignature();
    act(() => { result.current(courseId, false); });

    await waitFor(() => expect(loggingService.logError).toHaveBeenCalledTimes(1));
    expect(axiosMock.history.post[0].url).toEqual(integritySignatureUrl);
    expect(needsSignature()).toEqual(true);
  });
});
