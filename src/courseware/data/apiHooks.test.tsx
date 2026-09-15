import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { appendBrowserTimezoneToUrl } from '../../utils';
import { buildSimpleCourseBlocks } from '../../shared/data/__factories__/courseBlocks.factory';
import { buildOutlineFromBlocks } from './__factories__/learningSequencesOutline.factory';
import { getResponseStatus } from '../../data/http-error';
import { createTestQueryClient, initializeMockApp, seedSequenceModels } from '../../setupTest';
import initializeStore from '../../store';
import { updateModel } from '../../generic/model-store';
import { normalizeLearningSequencesData, normalizeOutlineBlocks, normalizeSequenceMetadata } from './utils';
import { fetchCourseSuccess } from './slice';
import { sequenceIdsSelector } from './selectors';
import { coursewareQueryKeys } from './queryKeys';
import type { CourseOutlineData } from './courseOutline';
import {
  useCheckBlockCompletion, useCourseOutlineStructure, useCoursewareMetadata, useCoursewareOutline,
  useCoursewareOutlineSidebarToggles, useSequenceMetadata,
} from './apiHooks';

const { loggingService } = initializeMockApp();

describe('courseware apiHooks — coursewareMeta bridge', () => {
  const courseMetadata = Factory.build('courseMetadata');
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
    axiosMock.onGet(metadataUrl).reply(() => new Promise((resolve) => {
      resolveMetadata = () => resolve([200, courseMetadata]);
    }));

    const queryClient = createTestQueryClient(store);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    renderHook(
      () => ({ meta: useCoursewareMetadata(courseId), outline: useCoursewareOutline(courseId) }),
      { wrapper },
    );

    // The outline resolves first and populates sectionIds.
    await waitFor(() => expect(coursewareMetaFor(courseId)?.sectionIds).toEqual(expectedSectionIds));
    store.dispatch(fetchCourseSuccess({ courseId }));
    expect(sequenceIdsSelector(store.getState())).toEqual(expectedSequenceIds);

    // Now let the metadata mirror land last.
    resolveMetadata();
    await waitFor(() => expect(coursewareMetaFor(courseId)?.title).toBe(courseMetadata.name));

    // sectionIds must survive.
    expect(coursewareMetaFor(courseId)?.sectionIds).toEqual(expectedSectionIds);
    expect(sequenceIdsSelector(store.getState())).toEqual(expectedSequenceIds);
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

  const renderSequence = (client: QueryClient) => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    return renderHook(() => useSequenceMetadata(sequenceId, false), { wrapper });
  };

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
