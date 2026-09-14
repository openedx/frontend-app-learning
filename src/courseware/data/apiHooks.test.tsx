import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { appendBrowserTimezoneToUrl } from '../../utils';
import { buildSimpleCourseBlocks } from '../../shared/data/__factories__/courseBlocks.factory';
import { buildOutlineFromBlocks } from './__factories__/learningSequencesOutline.factory';
import { getResponseStatus } from '../../data/http-error';
import { createTestQueryClient, initializeMockApp } from '../../setupTest';
import initializeStore from '../../store';
import { normalizeLearningSequencesData, normalizeSequenceMetadata } from './utils';
import { fetchCourseSuccess } from './slice';
import { sequenceIdsSelector } from './selectors';
import { useCoursewareMetadata, useCoursewareOutline, useSequenceMetadata } from './apiHooks';

initializeMockApp();

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
