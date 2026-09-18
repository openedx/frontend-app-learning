import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { appendBrowserTimezoneToUrl, executeThunk } from '../../utils';
import { buildSimpleCourseBlocks } from '../../shared/data/__factories__/courseBlocks.factory';
import { buildOutlineFromBlocks } from './__factories__/learningSequencesOutline.factory';
import { getResponseStatus } from '../../data/http-error';
import { createTestQueryClient, initializeMockApp, seedSequenceModels } from '../../setupTest';
import initializeStore from '../../store';
import { updateModel } from '../../generic/model-store';
import { normalizeLearningSequencesData, normalizeSequenceMetadata } from './utils';
import { fetchCourseSuccess } from './slice';
import { sequenceIdsSelector } from './selectors';
import { getCourseOutlineStructure } from './thunks';
import {
  useCheckBlockCompletion, useCoursewareMetadata, useCoursewareOutline, useSequenceMetadata,
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
  const navigationUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/navigation/${courseId}`;
  const completionUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler/get_completion`;

  let axiosMock: MockAdapter;
  let store: ReturnType<typeof initializeStore>;

  // The outline slice state starts as {} and is wholly replaced on load, so the seeded
  // shape doesn't overlap the inferred initial type — hence the cast through unknown.
  const outline = () => store.getState().courseware.courseOutline as unknown as {
    units: Record<string, { id: string, complete?: boolean }>;
    sequences: Record<string, { id: string, complete?: boolean, completionStat: { completed: number } }>;
    sections: Record<string, { id: string, complete?: boolean, completionStat: { completed: number } }>;
  };
  const unitModels = () => (store.getState().models as { units?: Record<string, { complete?: boolean }> }).units;

  const seedOutline = async () => {
    axiosMock.onGet(navigationUrl).reply(201, {
      ...courseBlocks,
      ...sequenceBlocks,
      ...unitBlocks,
    });
    await executeThunk(getCourseOutlineStructure(courseId), store.dispatch);
  };

  const renderCheckBlockCompletion = () => {
    const queryClient = createTestQueryClient(store);
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
    loggingService.logError.mockReset();
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
    await seedSequenceModels(store, [sequenceMetadata.item_id]);
  });

  it('marks the unit complete in the units model and rolls the outline up', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: true });
    await seedOutline();

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
  });

  it('writes complete: false to the units model and leaves the outline untouched', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: false });
    await seedOutline();

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
    await seedOutline();

    const [unit] = Object.values(outline().units);

    const { result, unmount } = renderCheckBlockCompletion();
    act(() => { result.current(courseId, sequenceId, unit.id); });
    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));

    unmount();
    resolveCompletion();

    await waitFor(() => expect(unitModels()?.[unit.id]?.complete).toBe(true));
    expect(outline().units[unit.id].complete).toBe(true);
  });

  it('still marks the unit complete, and logs, when the outline was never loaded', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: true });

    const { result } = renderCheckBlockCompletion();
    act(() => { result.current(courseId, sequenceId, unitId); });

    await waitFor(() => expect(unitModels()?.[unitId]?.complete).toBe(true));
    expect(loggingService.logError).toHaveBeenCalledTimes(1);
    expect(store.getState().courseware.courseOutline).toEqual({});
  });
});
