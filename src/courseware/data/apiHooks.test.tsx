import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';
import {
  getAuthenticatedHttpClient, getLoggingService, getSiteConfig, MockLoggingService, setAuthenticatedUser,
} from '@openedx/frontend-base';

import { courseHomeMetaQuery, useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { CourseParamsProvider } from '@src/generic/course-params';
import { queryDefaults } from '@src/queryClient';
import { authenticatedUser } from '@src/tests/authenticatedUser';
import { createTestQueryClient } from '@src/tests/queryClient';
import { appendBrowserTimezoneToUrl } from '../../utils';
import { buildSimpleCourseBlocks } from '../../shared/data/__factories__/courseBlocks.factory';
import { buildEmptyOutline, buildOutlineFromBlocks } from './__factories__/learningSequencesOutline.factory';
import { getResponseStatus } from '../../data/http-error';
import { normalizeMinimalCourseOutline } from './minimalCourseOutline';
import { normalizeCourseNavigationOutline } from './courseNavigationOutline';
import { normalizeSequenceMetadata } from './sequenceMetadata';
import type { CourseNavigationOutline } from './courseNavigationOutline';
import {
  courseOutlineStructureQuery, coursewareMetadataQuery, coursewareOutlineSidebarTogglesQuery, discussionTopicsQuery,
  minimalCourseOutlineQuery, parentSequenceQuery, resumeBlockQuery, sequenceMetadataQuery, sequenceMightBeUnit,
  updateSequenceUnit, useCheckBlockCompletion, useCourseOutlineStructure, useCoursewareMetadata,
  useCoursewareOutlineSidebarToggles, useDiscussionTopic, useIsCourseLoaded, useIsPreview, useMinimalCourseOutline,
  useSaveIntegritySignature, useSaveSequencePosition, useSequenceIds, useSequenceMetadata, useUnit,
} from './apiHooks';

const loggingService = getLoggingService() as MockLoggingService;

describe('courseware apiHooks', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const metadataUrl = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/courseware/course/*`);
  let axiosMock: MockAdapter;

  const buildWrapper = () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { wrapper };
  };

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(metadataUrl).reply(200, Factory.build('courseMetadata'));
  });

  it.each([
    ['coursewareMetadataQuery', coursewareMetadataQuery(courseId)],
    ['minimalCourseOutlineQuery', minimalCourseOutlineQuery(courseId)],
    ['resumeBlockQuery', resumeBlockQuery(courseId, 'visit')],
    ['parentSequenceQuery', parentSequenceQuery(courseId, 'unit')],
    ['courseOutlineStructureQuery', courseOutlineStructureQuery(courseId)],
    ['coursewareOutlineSidebarTogglesQuery', coursewareOutlineSidebarTogglesQuery(courseId)],
    ['discussionTopicsQuery', discussionTopicsQuery(courseId)],
  ])('%s carries the query defaults', (_, options) => {
    expect(options).toMatchObject(queryDefaults);
  });

  it('sequenceMetadataQuery keeps its own retry over the query defaults', () => {
    expect(sequenceMetadataQuery('sequence', false)).toMatchObject({ ...queryDefaults, retry: false });
  });

  describe('useCoursewareMetadata', () => {
    it('fetches the course metadata once', async () => {
      const { result } = renderHook(() => useCoursewareMetadata(courseId), buildWrapper());

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.id).toBe(courseId);
      expect(axiosMock.history.get).toHaveLength(1);
    });

    it.each([
      ['it is disabled', courseId, { enabled: false }],
      ['it has no course id', undefined, undefined],
    ])('requests nothing when %s', (_name, id, options) => {
      const { result } = renderHook(() => useCoursewareMetadata(id, options), buildWrapper());

      expect(result.current.fetchStatus).toBe('idle');
      expect(axiosMock.history.get).toHaveLength(0);
    });
  });

  // The LMS hands a streak to celebrate to the first request of the day that updates the streak, and on a unit page
  // that is either of the two metadata requests. The celebration is read from the course home metadata.
  describe('a streak that comes with the courseware metadata', () => {
    const courseHomeUrl = appendBrowserTimezoneToUrl(
      `${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`,
    );
    const coursewareMetadata = Factory.build('courseMetadata', {
      celebrations: {
        first_section: false, weekly_goal: false, streak_length_to_celebrate: 3, streak_discount_enabled: true,
      },
    });
    const courseHomeMetadata = (celebrations: object | null) => Factory.build('courseHomeMetadata', { celebrations });

    // Both metadata hooks, as the courseware page mounts them.
    const renderBoth = () => renderHook(() => ({
      courseware: useCoursewareMetadata(courseId),
      courseHome: useCourseHomeMeta(courseId),
    }), buildWrapper());

    beforeEach(() => {
      axiosMock.onGet(metadataUrl).reply(200, coursewareMetadata);
    });

    it('is handed on to the course home metadata that came without one', async () => {
      axiosMock.onGet(courseHomeUrl).reply(200, courseHomeMetadata({
        streak_length_to_celebrate: null, streak_discount_enabled: false, weekly_goal: true,
      }));
      const { result } = renderBoth();

      await waitFor(() => expect(result.current.courseware.isSuccess).toBe(true));
      expect(result.current.courseHome.data?.celebrations).toEqual({
        streakLengthToCelebrate: 3, streakDiscountEnabled: true, weeklyGoal: true,
      });
    });

    it('is handed on when the course home metadata returns second, with no request of its own', async () => {
      let respond: (value: [number, object]) => void = () => {};
      axiosMock.onGet(courseHomeUrl).reply(() => new Promise((resolve) => {
        respond = resolve;
      }));
      const { result } = renderBoth();
      await waitFor(() => expect(axiosMock.history.get).toHaveLength(2));

      respond([200, courseHomeMetadata(null)]);

      await waitFor(() => expect(result.current.courseware.isSuccess).toBe(true));
      expect(result.current.courseHome.data?.celebrations).toEqual({
        streakLengthToCelebrate: 3, streakDiscountEnabled: true,
      });
      expect(axiosMock.history.get).toHaveLength(2);
    });

    it('leaves the streak the course home metadata came with', async () => {
      axiosMock.onGet(courseHomeUrl).reply(200, courseHomeMetadata({
        streak_length_to_celebrate: 7, streak_discount_enabled: false,
      }));
      const { result } = renderBoth();

      await waitFor(() => expect(result.current.courseware.isSuccess).toBe(true));
      expect(result.current.courseHome.data?.celebrations).toEqual({
        streakLengthToCelebrate: 7, streakDiscountEnabled: false,
      });
    });

    it('does not keep the courseware metadata from loading when the course home metadata fails', async () => {
      axiosMock.onGet(courseHomeUrl).reply(403);
      const { result } = renderBoth();

      await waitFor(() => expect(result.current.courseware.isSuccess).toBe(true));
      expect(result.current.courseware.data?.celebrations.streakLengthToCelebrate).toBe(3);
      await waitFor(() => expect(result.current.courseHome.isError).toBe(true));
    });
  });

  describe('useIsPreview', () => {
    it.each([
      [true, true],
      [false, false],
      [undefined, false],
    ])('with isPreview %s is %s', (isPreview, expected) => {
      const { result } = renderHook(() => useIsPreview(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <CourseParamsProvider courseId={courseId} isPreview={isPreview}>{children}</CourseParamsProvider>
        ),
      });

      expect(result.current).toBe(expected);
    });
  });
});

describe('courseware apiHooks — useSequenceIds', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseHomeMetadata = Factory.build('courseHomeMetadata');
  const courseId = courseMetadata.id;
  const { courseBlocks } = buildSimpleCourseBlocks(courseId);
  const outlineResponse = buildOutlineFromBlocks(courseBlocks);
  const normalizedOutline = normalizeMinimalCourseOutline(outlineResponse);
  const expectedSequenceIds = normalizedOutline.courses[courseId].sectionIds.flatMap(
    (id: string) => normalizedOutline.sections[id].sequenceIds,
  );

  let axiosMock: MockAdapter;
  const outlineUrl = `${getSiteConfig().lmsBaseUrl}/api/learning_sequences/v1/course_outline/${courseId}`;
  const metadataUrl = appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/courseware/course/${courseId}`);
  const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(
    `${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`,
  );

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  const makeWrapper = (client: QueryClient) => function Wrapper(
    { children }: { children: ReactNode },
  ) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

  it('is empty until the course is loaded, then lists the sequences in section order', async () => {
    let resolveMetadata: () => void = () => {};
    axiosMock.onGet(outlineUrl).reply(200, outlineResponse);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);
    axiosMock.onGet(metadataUrl).reply(() => new Promise((resolve) => {
      resolveMetadata = () => resolve([200, courseMetadata]);
    }));

    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => {
      useCoursewareMetadata(courseId);
      useMinimalCourseOutline(courseId);
      useCourseHomeMeta(courseId);
      return useSequenceIds(courseId);
    }, { wrapper: makeWrapper(queryClient) });

    // The outline has resolved, but the loaded gate still waits on the metadata: no ids yet.
    await waitFor(() => (
      expect(queryClient.getQueryState(minimalCourseOutlineQuery(courseId).queryKey)?.status).toBe('success')
    ));
    expect(result.current).toEqual([]);

    resolveMetadata();
    await waitFor(() => expect(result.current).toEqual(expectedSequenceIds));
  });

  it('is empty for a loaded course whose outline has no sections', async () => {
    axiosMock.onGet(outlineUrl).reply(200, buildEmptyOutline(courseId));
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);
    axiosMock.onGet(metadataUrl).reply(200, courseMetadata);

    const { result } = renderHook(() => {
      useCoursewareMetadata(courseId);
      useMinimalCourseOutline(courseId);
      useCourseHomeMeta(courseId);
      return { isCourseLoaded: useIsCourseLoaded(courseId), sequenceIds: useSequenceIds(courseId) };
    }, { wrapper: makeWrapper(createTestQueryClient()) });

    await waitFor(() => expect(result.current.isCourseLoaded).toBe(true));
    expect(result.current.sequenceIds).toEqual([]);
  });

  it('fetches nothing on its own', () => {
    axiosMock.onGet(outlineUrl).reply(200, outlineResponse);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);
    axiosMock.onGet(metadataUrl).reply(200, courseMetadata);
    const { result } = renderHook(() => useSequenceIds(courseId), { wrapper: makeWrapper(createTestQueryClient()) });

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
  const outlineUrl = `${getSiteConfig().lmsBaseUrl}/api/learning_sequences/v1/course_outline/${courseId}`;
  const metadataUrl = appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/courseware/course/${courseId}`);
  const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(
    `${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`,
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
      useMinimalCourseOutline(id);
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
      expect(statusOf(queryClient, minimalCourseOutlineQuery(courseId).queryKey)).toBe('success');
      expect(statusOf(queryClient, courseHomeMetaQuery(courseId).queryKey)).toBe('success');
    });
    expect(statusOf(queryClient, coursewareMetadataQuery(courseId).queryKey)).toBe('pending');
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
    expect(queryClient.getQueryData(courseHomeMetaQuery(courseId).queryKey)?.courseAccess.hasAccess).toBe(false);
    expect(result.current).toBe(false);
  });

  it('is false when the outline fails', async () => {
    mockHappyPath();
    axiosMock.onGet(outlineUrl).reply(403, {});
    const queryClient = createTestQueryClient();
    const { result } = renderLoaded(courseId, queryClient);

    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(statusOf(queryClient, minimalCourseOutlineQuery(courseId).queryKey)).toBe('error');
    expect(result.current).toBe(false);
  });

  it('is false when a query fails', async () => {
    mockHappyPath();
    axiosMock.onGet(metadataUrl).reply(500, {});
    const queryClient = createTestQueryClient();
    const { result } = renderLoaded(courseId, queryClient);

    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(statusOf(queryClient, coursewareMetadataQuery(courseId).queryKey)).toBe('error');
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
  const sequenceUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/sequence/${sequenceMetadata.item_id}`;

  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  const makeWrapper = (client: QueryClient, isPreview = false) => function Wrapper(
    { children }: { children: ReactNode },
  ) {
    return (
      <CourseParamsProvider courseId={courseId} sequenceId={sequenceId} isPreview={isPreview}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </CourseParamsProvider>
    );
  };

  const renderSequence = (
    client: QueryClient = createTestQueryClient(),
    isPreview = false,
  ) => renderHook(() => useSequenceMetadata(sequenceId), { wrapper: makeWrapper(client, isPreview) });

  it('fetches and normalizes the sequence and its units', async () => {
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);

    const { result } = renderSequence(createTestQueryClient());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ sequence: normalizedSequence, units: normalizedUnits });
  });

  it('starts at the unit the response gives as the position', async () => {
    const positioned = Factory.build('sequenceMetadata', { position: 3 }, { courseId });
    axiosMock
      .onGet(`${getSiteConfig().lmsBaseUrl}/api/courseware/sequence/${positioned.item_id}`)
      .reply(200, positioned);

    const { sequence } = await createTestQueryClient().fetchQuery(sequenceMetadataQuery(positioned.item_id, false));

    expect(sequence.activeUnitIndex).toBe(2);
  });

  it('builds no sequence without a course id', () => {
    expect(() => Factory.build('sequenceMetadata')).toThrow('option `courseId` has no default value and none was provided');
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
      { wrapper: makeWrapper(createTestQueryClient()) },
    );
    expect(result.current.isPending).toBe(true);
    expect(axiosMock.history.get).toHaveLength(0);
  });

  it('fetches nothing on its own when disabled', () => {
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
    const { result } = renderHook(
      () => useSequenceMetadata(sequenceId, { enabled: false }),
      { wrapper: makeWrapper(createTestQueryClient()) },
    );
    expect(result.current.fetchStatus).toBe('idle');
    expect(axiosMock.history.get).toHaveLength(0);
  });

  it('reads the owner\'s result without fetching again', async () => {
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
    const queryClient = createTestQueryClient();
    const owner = renderSequence(queryClient);
    await waitFor(() => expect(owner.result.current.isSuccess).toBe(true));

    const reader = renderHook(
      () => useSequenceMetadata(sequenceId, { enabled: false }),
      { wrapper: makeWrapper(queryClient) },
    );
    expect(reader.result.current.isSuccess).toBe(true);
    expect(reader.result.current.data).toEqual({ sequence: normalizedSequence, units: normalizedUnits });
    expect(axiosMock.history.get).toHaveLength(1);
  });

  it('requests preview metadata when previewing', async () => {
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
    const { result } = renderSequence(createTestQueryClient(), true);
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
  const { courseBlocks, sectionBlocks, sequenceBlocks } = buildSimpleCourseBlocks(courseId);
  const navigationUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/v1/navigation/${courseId}`;

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
    expect(result.current.data).toEqual(normalizeCourseNavigationOutline(courseBlocks.blocks));
  });

  it('gives a section and a sequence without children an empty list of ids', async () => {
    const [section] = sectionBlocks;
    const [sequence] = sequenceBlocks;
    axiosMock.onGet(navigationUrl).reply(200, {
      blocks: {
        [section.id]: { ...section, children: undefined },
        [sequence.id]: { ...sequence, children: undefined },
      },
    });

    const { result } = renderOutline();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.sections[section.id].sequenceIds).toEqual([]);
    expect(result.current.data?.sequences[sequence.id].unitIds).toEqual([]);
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
  const togglesUrl = `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/courseware-navigation-sidebar/toggles/`;

  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  const renderToggles = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
    );
    return renderHook(() => useCoursewareOutlineSidebarToggles(courseId), { wrapper });
  };

  it('returns the camelCased completion-tracking flag', async () => {
    axiosMock.onGet(togglesUrl).reply(200, { enable_completion_tracking: true });

    const { result } = renderToggles();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ enableCompletionTracking: true });
  });

  it('returns the flag as false when the response omits it', async () => {
    axiosMock.onGet(togglesUrl).reply(200, {});

    const { result } = renderToggles();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ enableCompletionTracking: false });
  });

  it('leaves the flag unset on failure', async () => {
    axiosMock.onGet(togglesUrl).networkError();

    const { result } = renderToggles();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe('courseware apiHooks — discussionTopicsQuery', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const configUrl = `${getSiteConfig().lmsBaseUrl}/api/discussion/v1/courses/${courseId}`;
  const topicsUrl = `${getSiteConfig().lmsBaseUrl}/api/discussion/v2/course_topics/${courseId}`;
  const topicsQueryKey = discussionTopicsQuery(courseId).queryKey;

  let axiosMock: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    queryClient = createTestQueryClient();
  });

  it('loads openedx-provider topics that have a usage key', async () => {
    axiosMock.onGet(configUrl).reply(200, { provider: 'openedx' });
    axiosMock.onGet(topicsUrl).reply(200, [
      { id: 'topic-1', usage_key: 'unit-1', enabled_in_context: true },
      { id: 'course-wide-topic', usage_key: null, enabled_in_context: true },
    ]);

    await queryClient.query(discussionTopicsQuery(courseId));

    expect(queryClient.getQueryData(topicsQueryKey)).toEqual([
      { id: 'topic-1', usageKey: 'unit-1', enabledInContext: true },
      // the course-wide topic has no usage key, so it is dropped
    ]);
  });

  it('skips the topics request entirely for a legacy provider', async () => {
    axiosMock.onGet(configUrl).reply(200, { provider: 'legacy' });

    await queryClient.query(discussionTopicsQuery(courseId));

    expect(axiosMock.history.get.map(request => request.url)).toEqual([configUrl]);
    expect(queryClient.getQueryData(topicsQueryKey)).toEqual([]);
  });

  it('caches nothing when the config request fails', async () => {
    axiosMock.onGet(configUrl).networkError();

    await expect(queryClient.query(discussionTopicsQuery(courseId))).rejects.toThrow();

    expect(queryClient.getQueryData(topicsQueryKey)).toBeUndefined();
  });
});

describe('courseware apiHooks — useDiscussionTopic', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const configUrl = `${getSiteConfig().lmsBaseUrl}/api/discussion/v1/courses/${courseId}`;
  const topicsUrl = `${getSiteConfig().lmsBaseUrl}/api/discussion/v2/course_topics/${courseId}`;
  const topic = { id: 'topic-1', usageKey: 'unit-1', enabledInContext: true };

  let axiosMock: MockAdapter;

  const makeWrapper = (client: QueryClient) => function Wrapper(
    { children }: { children: ReactNode },
  ) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

  const mockTopics = () => {
    axiosMock.onGet(configUrl).reply(200, { provider: 'openedx' });
    axiosMock.onGet(topicsUrl).reply(200, [{ id: 'topic-1', usage_key: 'unit-1', enabled_in_context: true }]);
  };

  const renderTopic = (unitId: string, queryClient: QueryClient) => (
    renderHook(() => useDiscussionTopic(courseId, unitId), { wrapper: makeWrapper(queryClient) })
  );

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('returns the topic for its unit', async () => {
    mockTopics();
    const queryClient = createTestQueryClient();
    await queryClient.query(discussionTopicsQuery(courseId));

    const { result } = renderTopic('unit-1', queryClient);

    expect(result.current.data).toEqual(topic);
  });

  it('returns undefined for a unit with no topic', async () => {
    mockTopics();
    const queryClient = createTestQueryClient();
    await queryClient.query(discussionTopicsQuery(courseId));

    const { result } = renderTopic('unit-2', queryClient);

    expect(result.current.data).toBeUndefined();
  });

  it('fetches nothing on its own', async () => {
    mockTopics();

    const { result } = renderTopic('unit-1', createTestQueryClient());
    await act(async () => {});

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(axiosMock.history.get).toHaveLength(0);
  });

  it('sees the topics when the query resolves after it mounted', async () => {
    mockTopics();
    const queryClient = createTestQueryClient();
    const { result } = renderTopic('unit-1', queryClient);
    expect(result.current.data).toBeUndefined();

    await act(async () => {
      await queryClient.query(discussionTopicsQuery(courseId));
    });

    await waitFor(() => expect(result.current.data).toEqual(topic));
  });
});

describe('courseware apiHooks — useUnit', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const { unitBlocks, sequenceBlocks } = buildSimpleCourseBlocks(courseId);
  const sequenceMetadata = Factory.build(
    'sequenceMetadata',
    {},
    { courseId, unitBlocks, sequenceBlock: sequenceBlocks[0] },
  );
  const sequenceId = sequenceBlocks[0].id;
  const unitId = unitBlocks[0].id;
  const { units: normalizedUnits } = normalizeSequenceMetadata(sequenceMetadata);
  const sequenceUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/sequence/${sequenceMetadata.item_id}`;

  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
  });

  const makeWrapper = (client: QueryClient) => function Wrapper(
    { children }: { children: ReactNode },
  ) {
    return (
      <CourseParamsProvider courseId={courseId} sequenceId={sequenceId} unitId={unitId}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </CourseParamsProvider>
    );
  };

  it('fetches nothing on its own', () => {
    const { result } = renderHook(() => useUnit(sequenceId, unitId), { wrapper: makeWrapper(createTestQueryClient()) });
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
    expect(axiosMock.history.get).toHaveLength(0);
  });

  it('returns the unit from the sequence the owner loaded', async () => {
    const { result } = renderHook(() => {
      useSequenceMetadata(sequenceId);
      return useUnit(sequenceId, unitId);
    }, { wrapper: makeWrapper(createTestQueryClient()) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(normalizedUnits.find((unit) => unit.id === unitId));
    expect(axiosMock.history.get).toHaveLength(1);
  });

  it('returns undefined for a unit that is not in the sequence', async () => {
    const { result } = renderHook(() => {
      useSequenceMetadata(sequenceId);
      return useUnit(sequenceId, 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@not_in_this_sequence');
    }, { wrapper: makeWrapper(createTestQueryClient()) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
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
  const sequenceUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/sequence/${sequenceMetadata.item_id}`;
  const completionUrl = `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/xblock/${sequenceId}/handler/get_completion`;
  const outlineQueryKey = courseOutlineStructureQuery(courseId).queryKey;

  const sequenceKey = sequenceMetadataQuery(sequenceId, false).queryKey;

  let axiosMock: MockAdapter;
  let queryClient: QueryClient;

  const outline = () => queryClient.getQueryData(outlineQueryKey)!;
  const cachedUnit = (id: string) => (
    queryClient.getQueryData(sequenceKey)?.units.find((unit) => unit.id === id)
  );

  const seedOutline = () => {
    queryClient.setQueryData(outlineQueryKey, normalizeCourseNavigationOutline(courseBlocks.blocks));
  };

  const renderCheckBlockCompletion = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CourseParamsProvider courseId={courseId} sequenceId={sequenceId}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </CourseParamsProvider>
    );
    return renderHook(() => useCheckBlockCompletion(), { wrapper });
  };

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    queryClient = createTestQueryClient();
    loggingService.logError.mockReset();
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
    await queryClient.fetchQuery(sequenceMetadataQuery(sequenceId, false));
  });

  it('marks the unit complete in the cached sequence and rolls the outline up', async () => {
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
    act(() => {
      result.current(courseId, sequenceId, unit.id);
    });

    await waitFor(() => expect(cachedUnit(unit.id)?.complete).toBe(true));
    expect(outline().units[unit.id].complete).toBe(true);
    expect(outline().sequences[sequence.id].complete).toBe(true);
    expect(outline().sections[section.id].complete).toBe(true);
    // No locked sequence in the section, so no refetch is triggered.
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('leaves the sequence incomplete while another of its units is', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: true });
    const otherUnit = Factory.build('block', { type: 'vertical' }, { courseId });
    queryClient.setQueryData(outlineQueryKey, normalizeCourseNavigationOutline({
      ...courseBlocks.blocks,
      [otherUnit.id]: otherUnit,
      [sequenceId]: { ...sequenceBlocks[0], children: [unitId, otherUnit.id] },
    }));

    const { result } = renderCheckBlockCompletion();
    act(() => {
      result.current(courseId, sequenceId, unitId);
    });

    await waitFor(() => expect(outline().units[unitId].complete).toBe(true));
    expect(outline().sequences[sequenceId].complete).not.toBeTruthy();
    expect(outline().sequences[sequenceId].completionStat.completed).toBe(1);
  });

  it('writes complete: false to the cached sequence and leaves the outline untouched', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: false });
    seedOutline();

    const [unit] = Object.values(outline().units);
    const [sequence] = Object.values(outline().sequences);
    const [section] = Object.values(outline().sections);

    const { result } = renderCheckBlockCompletion();
    act(() => {
      result.current(courseId, sequenceId, unit.id);
    });

    await waitFor(() => expect(cachedUnit(unit.id)?.complete).toBe(false));
    expect(outline().units[unit.id].complete).not.toBeTruthy();
    expect(outline().sequences[sequence.id].complete).not.toBeTruthy();
    expect(outline().sections[section.id].complete).not.toBeTruthy();
  });

  it('logs the error and writes nothing when the completion request fails', async () => {
    axiosMock.onPost(completionUrl).networkError();

    const { result } = renderCheckBlockCompletion();
    act(() => {
      result.current(courseId, sequenceId, unitId);
    });

    await waitFor(() => expect(loggingService.logError).toHaveBeenCalledTimes(1));
    expect(axiosMock.history.post[0].url).toEqual(completionUrl);
    expect(cachedUnit(unitId)?.complete).not.toBe(true);
  });

  it('skips the request entirely when the unit is already complete', async () => {
    updateSequenceUnit(queryClient, sequenceKey, unitId, { complete: true });

    const { result } = renderCheckBlockCompletion();
    await act(async () => {
      result.current(courseId, sequenceId, unitId);
    });

    expect(axiosMock.history.post).toHaveLength(0);
  });

  it('proceeds to the request for a sequence with no cache entry, and writes nothing', async () => {
    queryClient.removeQueries({ queryKey: sequenceKey });
    axiosMock.onPost(completionUrl).reply(201, { complete: true });

    const { result } = renderCheckBlockCompletion();
    act(() => {
      result.current(courseId, sequenceId, unitId);
    });

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    await act(async () => {});
    expect(queryClient.getQueryData(sequenceKey)).toBeUndefined();
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
    act(() => {
      result.current(courseId, sequenceId, unit.id);
    });
    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));

    unmount();
    resolveCompletion();

    await waitFor(() => expect(cachedUnit(unit.id)?.complete).toBe(true));
    expect(outline().units[unit.id].complete).toBe(true);
  });

  it('still marks the unit complete, quietly, when the outline was never cached', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: true });

    const { result } = renderCheckBlockCompletion();
    act(() => {
      result.current(courseId, sequenceId, unitId);
    });

    await waitFor(() => expect(cachedUnit(unitId)?.complete).toBe(true));
    expect(loggingService.logError).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(outlineQueryKey)).toBeUndefined();
  });

  it('leaves the outline untouched when the cached tree does not contain the unit', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: true });
    seedOutline();
    const foreignUnitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@not_in_this_outline';
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderCheckBlockCompletion();
    act(() => {
      result.current(courseId, sequenceId, foreignUnitId);
    });

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    await act(async () => {});
    expect(outline()).toEqual(normalizeCourseNavigationOutline(courseBlocks.blocks));
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(loggingService.logError).not.toHaveBeenCalled();
  });

  it('invalidates the outline query when completing a sequence in a section with a locked sequence', async () => {
    axiosMock.onPost(completionUrl).reply(201, { complete: true });
    const lockedOutline: CourseNavigationOutline = {
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
    act(() => {
      result.current(courseId, sequenceId, 'unit-1');
    });

    // 'unit-1' belongs to the hand-built outline only, so the sequence write is a no-op here.
    await waitFor(() => expect(outline().units['unit-1'].complete).toBe(true));
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
  const sequenceKey = sequenceMetadataQuery(sequenceId, false).queryKey;
  const sequenceUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/sequence/${sequenceMetadata.item_id}`;
  const gotoPositionUrl = `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/xblock/${sequenceId}/handler/goto_position`;

  let axiosMock: MockAdapter;
  let queryClient: QueryClient;

  const activeUnitIndex = () => queryClient.getQueryData(sequenceKey)?.sequence.activeUnitIndex;

  const renderSaveSequencePosition = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CourseParamsProvider courseId={courseId} sequenceId={sequenceId}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </CourseParamsProvider>
    );
    return renderHook(() => useSaveSequencePosition(), { wrapper });
  };

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    queryClient = createTestQueryClient();
    loggingService.logError.mockReset();
    // The rollback pre-read needs the cached sequence, which callers always
    // have (the save only fires from a rendered sequence).
    axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
    await queryClient.fetchQuery(sequenceMetadataQuery(sequenceId, false));
  });

  it('updates the cached activeUnitIndex and posts the 1-indexed position', async () => {
    axiosMock.onPost(gotoPositionUrl).reply(201, {});
    const newPosition = 123;

    const { result } = renderSaveSequencePosition();
    act(() => {
      result.current(courseId, sequenceId, newPosition);
    });

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(axiosMock.history.post[0].url).toEqual(gotoPositionUrl);
    // Position is 1-indexed on the server and 0-indexed in this app.
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ position: newPosition + 1 });
    expect(activeUnitIndex()).toEqual(newPosition);
  });

  it('changes and reverts the cached activeUnitIndex in case of error', async () => {
    axiosMock.onPost(gotoPositionUrl).networkError();
    const oldPosition = activeUnitIndex();
    const newPosition = 123;

    const { result } = renderSaveSequencePosition();
    act(() => {
      result.current(courseId, sequenceId, newPosition);
    });

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
    act(() => {
      result.current(courseId, sequenceId, newPosition);
    });

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(activeUnitIndex()).toEqual(newPosition);

    await act(async () => {
      resolvePost();
    });
    expect(activeUnitIndex()).toEqual(newPosition);
  });

  it('writes nothing for a sequence with no cache entry', async () => {
    queryClient.removeQueries({ queryKey: sequenceKey });
    axiosMock.onPost(gotoPositionUrl).reply(201, {});

    const { result } = renderSaveSequencePosition();
    act(() => {
      result.current(courseId, sequenceId, 2);
    });

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    await act(async () => {});
    expect(queryClient.getQueryData(sequenceKey)).toBeUndefined();
  });
});

describe('courseware apiHooks — useSaveIntegritySignature', () => {
  const courseMetadata = Factory.build('courseMetadata', { user_needs_integrity_signature: true });
  const courseId = courseMetadata.id;
  const integritySignatureUrl = `${getSiteConfig().lmsBaseUrl}/api/agreements/v1/integrity_signature/${courseId}`;
  const metadataUrl = appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/courseware/course/${courseId}`);
  const metadataKey = coursewareMetadataQuery(courseId).queryKey;

  let axiosMock: MockAdapter;
  let queryClient: QueryClient;

  const needsSignature = () => queryClient.getQueryData(metadataKey)?.userNeedsIntegritySignature;

  const renderSaveIntegritySignature = () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return renderHook(() => useSaveIntegritySignature(), { wrapper });
  };

  beforeEach(async () => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    queryClient = createTestQueryClient();
    loggingService.logError.mockReset();
    axiosMock.onGet(metadataUrl).reply(200, courseMetadata);
    await queryClient.fetchQuery(coursewareMetadataQuery(courseId));
  });

  it('updates userNeedsIntegritySignature upon success', async () => {
    axiosMock.onPost(integritySignatureUrl).reply(200, {});

    const { result } = renderSaveIntegritySignature();
    act(() => {
      result.current(courseId, false);
    });

    await waitFor(() => expect(needsSignature()).toEqual(false));
    expect(axiosMock.history.post[0].url).toEqual(integritySignatureUrl);
  });

  it('dismisses the prompt without a request when masquerading as a specific learner', async () => {
    const { result } = renderSaveIntegritySignature();
    act(() => {
      result.current(courseId, true);
    });

    await waitFor(() => expect(needsSignature()).toEqual(false));
    expect(axiosMock.history.post).toHaveLength(0);
  });

  it('logs the error and leaves the prompt in place when the request fails', async () => {
    axiosMock.onPost(integritySignatureUrl).networkError();

    const { result } = renderSaveIntegritySignature();
    act(() => {
      result.current(courseId, false);
    });

    await waitFor(() => expect(loggingService.logError).toHaveBeenCalledTimes(1));
    expect(axiosMock.history.post[0].url).toEqual(integritySignatureUrl);
    expect(needsSignature()).toEqual(true);
  });

  it('writes nothing for a course with no cache entry', async () => {
    queryClient.removeQueries({ queryKey: metadataKey });
    axiosMock.onPost(integritySignatureUrl).reply(200, {});

    const { result } = renderSaveIntegritySignature();
    act(() => {
      result.current(courseId, false);
    });

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    await act(async () => {});
    expect(queryClient.getQueryData(metadataKey)).toBeUndefined();
  });
});

describe('courseware apiHooks — resumeBlockQuery', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const resumeUrl = `${getSiteConfig().lmsBaseUrl}/api/courseware/resume/${courseId}`;

  it('returns the resume block in camel case', async () => {
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(resumeUrl).reply(200, { block_id: 'block', section_id: 'sequence', unit_id: 'unit' });

    const resumeBlock = await createTestQueryClient().fetchQuery(resumeBlockQuery(courseId, 'visit'));

    expect(resumeBlock).toEqual({ blockId: 'block', sectionId: 'sequence', unitId: 'unit' });
  });
});

describe('courseware apiHooks — parentSequenceQuery', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const { courseBlocks, sequenceBlocks, unitBlocks } = buildSimpleCourseBlocks(courseId);
  const blocksUrl = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/courses/v2/blocks/*`);

  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(blocksUrl).reply(200, courseBlocks);
  });

  afterEach(() => {
    setAuthenticatedUser(authenticatedUser);
  });

  const requestedParams = () => Object.fromEntries(new URL(axiosMock.history.get[0].url ?? '').searchParams);

  it('returns the sequence that holds the unit', async () => {
    const parent = await createTestQueryClient().fetchQuery(parentSequenceQuery(courseId, unitBlocks[0].id));

    expect(parent).toBe(sequenceBlocks[0].id);
    expect(requestedParams()).toEqual({
      course_id: courseId,
      username: authenticatedUser.username,
      depth: '3',
      requested_fields: 'children,discussions_url',
    });
  });

  it('returns null when no sequence holds the unit', async () => {
    const parent = await createTestQueryClient().fetchQuery(parentSequenceQuery(courseId, 'not-a-unit'));

    expect(parent).toBeNull();
  });

  it('asks with an empty username when no user is signed in', async () => {
    setAuthenticatedUser(null);

    await createTestQueryClient().fetchQuery(parentSequenceQuery(courseId, unitBlocks[0].id));

    expect(requestedParams().username).toBe('');
  });
});
