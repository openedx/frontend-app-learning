import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '../../setupTest';
import initializeStore from '../../store';
import { appendBrowserTimezoneToUrl } from '../../utils';
import { buildSimpleCourseBlocks } from '../../shared/data/__factories__/courseBlocks.factory';
import { buildOutlineFromBlocks } from './__factories__/learningSequencesOutline.factory';
import {
  getCourseMetadata, getSequenceForBlockDeprecated, getSequenceForUnitDeprecated, getSequenceForUnitDeprecatedUrl,
} from './api';
import { fetchCourse, fetchSequence, getCourseOutlineStructure } from './thunks';

const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

describe('Native courseware recovery', () => {
  let http;
  let store;
  let loggingService;
  const lms = getConfig().LMS_BASE_URL;
  const courseId = 'course-v1:Test+Recovery+2026';
  const metadataUrl = appendBrowserTimezoneToUrl(`${lms}/api/courseware/course/${courseId}`);
  const navigationUrl = id => `${lms}/api/course_home/v1/navigation/${id}`;
  const metadata = Factory.build('courseMetadata', { id: courseId });

  beforeEach(() => {
    ({ loggingService } = initializeMockApp());
    http = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
  });

  afterEach(() => {
    http.restore();
    jest.useRealTimers();
  });

  function mockBootstrap(id, {
    metadataReply, outlineReply, homeReply, toggleReply,
  } = {}) {
    const { courseBlocks } = buildSimpleCourseBlocks(id);
    http.onGet(appendBrowserTimezoneToUrl(`${lms}/api/courseware/course/${id}`))
      .reply(metadataReply || (() => [200, Factory.build('courseMetadata', { id })]));
    http.onGet(`${lms}/api/learning_sequences/v1/course_outline/${id}`)
      .reply(outlineReply || (() => [200, buildOutlineFromBlocks(courseBlocks)]));
    http.onGet(appendBrowserTimezoneToUrl(`${lms}/api/course_home/course_metadata/${id}`))
      .reply(homeReply || (() => [200, Factory.build('courseHomeMetadata')]));
    http.onGet(`${lms}/courses/${id}/courseware-navigation-sidebar/toggles/`)
      .reply(toggleReply || (() => [200, { enable_completion_tracking: true }]));
  }

  it('joins four sidebar callers into one HTTP flight, and fetches again after settlement', async () => {
    const gate = deferred();
    http.onGet(navigationUrl(courseId)).reply(() => gate.promise);
    const requests = Array.from({ length: 4 }, () => store.dispatch(getCourseOutlineStructure(courseId)));
    await Promise.resolve();
    expect(http.history.get).toHaveLength(1);
    gate.resolve([200, { blocks: {} }]);
    await Promise.all(requests);
    expect(store.getState().courseware.courseOutlineStatus).toBe('loaded');
    await store.dispatch(getCourseOutlineStructure(courseId));
    expect(http.history.get).toHaveLength(2);
  });

  it('releases a rejected flight so an ordinary retry can recover', async () => {
    http.onGet(navigationUrl(courseId)).replyOnce(503);
    await Promise.all([
      store.dispatch(getCourseOutlineStructure(courseId)),
      store.dispatch(getCourseOutlineStructure(courseId)),
    ]);
    expect(http.history.get).toHaveLength(1);
    expect(store.getState().courseware.courseOutlineStatus).toBe('failed');
    http.onGet(navigationUrl(courseId)).reply(200, { blocks: {} });
    await store.dispatch(getCourseOutlineStructure(courseId));
    expect(http.history.get).toHaveLength(2);
    expect(store.getState().courseware.courseOutlineStatus).toBe('loaded');
  });

  it('does not share an in-flight request between Redux stores', async () => {
    const gate = deferred();
    const other = initializeStore();
    http.onGet(navigationUrl(courseId)).reply(() => gate.promise);
    const first = store.dispatch(getCourseOutlineStructure(courseId));
    const second = other.dispatch(getCourseOutlineStructure(courseId));
    await Promise.resolve();
    expect(http.history.get).toHaveLength(2);
    gate.resolve([200, { blocks: {} }]);
    await Promise.all([first, second]);
    expect(store.getState().courseware.courseOutlineStatus).toBe('loaded');
    expect(other.getState().courseware.courseOutlineStatus).toBe('loaded');
  });

  it.each([200, 503])('ignores stale outline settlement (%s) after another course finishes', async status => {
    const gate = deferred();
    http.onGet(navigationUrl(courseId)).reply(() => gate.promise);
    http.onGet(navigationUrl('new-course')).reply(200, { blocks: {} });
    const old = store.dispatch(getCourseOutlineStructure(courseId));
    await store.dispatch(getCourseOutlineStructure('new-course'));
    const current = store.getState().courseware;
    gate.resolve([status, { blocks: { unit: { id: 'old-unit', type: 'vertical' } } }]);
    await old;
    expect(store.getState().courseware).toEqual(current);
  });

  it('retrieves all depths and resolves a leaf nested below its vertical unit', async () => {
    const url = getSequenceForUnitDeprecatedUrl(courseId);
    expect(url.searchParams.get('depth')).toBe('all');
    http.onGet(url.href).reply(200, {
      blocks: {
        seq: { id: 'seq', type: 'sequential', children: ['unit'] },
        unit: { id: 'unit', type: 'vertical', children: ['group'] },
        group: { id: 'group', type: 'html', children: ['leaf'] },
        leaf: { id: 'leaf', type: 'problem' },
      },
    });
    await expect(getSequenceForBlockDeprecated(courseId, 'leaf')).resolves.toEqual({ sequenceId: 'seq', unitId: 'unit' });
    await expect(getSequenceForUnitDeprecated(courseId, 'unit')).resolves.toBe('seq');
  });

  it.each([
    ['missing', { seq: { id: 'seq', type: 'sequential', children: [] } }],
    ['cycle', { leaf: { id: 'leaf', type: 'html', children: ['group'] }, group: { id: 'group', type: 'html', children: ['leaf'] } }],
    ['ambiguous', {
      seq: { id: 'seq', type: 'sequential', children: ['a', 'b'] },
      a: { id: 'a', type: 'vertical', children: ['leaf'] },
      b: { id: 'b', type: 'vertical', children: ['leaf'] },
      leaf: { id: 'leaf', type: 'problem' },
    }],
    ['non-unit', { seq: { id: 'seq', type: 'sequential', children: ['leaf'] }, leaf: { id: 'leaf', type: 'problem' } }],
  ])('refuses %s ancestry', async (_, blocks) => {
    http.onGet(getSequenceForUnitDeprecatedUrl(courseId).href).reply(200, { blocks });
    await expect(getSequenceForBlockDeprecated(courseId, 'leaf')).resolves.toBeNull();
  });

  it.each([503, 'network'])('retries transient %s twice, then returns native normalized metadata', async failure => {
    jest.useFakeTimers();
    if (failure === 'network') {
      http.onGet(metadataUrl).networkErrorOnce();
      http.onGet(metadataUrl).networkErrorOnce();
    } else {
      http.onGet(metadataUrl).replyOnce(failure);
      http.onGet(metadataUrl).replyOnce(failure);
    }
    http.onGet(metadataUrl).reply(200, metadata);
    const request = getCourseMetadata(courseId);
    await jest.advanceTimersByTimeAsync(499);
    expect(http.history.get).toHaveLength(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(http.history.get).toHaveLength(2);
    await jest.advanceTimersByTimeAsync(1500);
    await expect(request).resolves.toEqual(expect.objectContaining({ id: courseId, title: metadata.name }));
    expect(http.history.get).toHaveLength(3);
  });

  it('stops after three failed attempts rather than retrying forever', async () => {
    jest.useFakeTimers();
    http.onGet(metadataUrl).reply(503);
    const rejected = expect(getCourseMetadata(courseId)).rejects.toMatchObject({ response: { status: 503 } });
    await jest.advanceTimersByTimeAsync(2000);
    await rejected;
    expect(http.history.get).toHaveLength(3);
  });

  it.each([401, 403, 404, 422])('does not retry HTTP %s', async status => {
    http.onGet(metadataUrl).reply(status);
    await expect(getCourseMetadata(courseId)).rejects.toMatchObject({ response: { status } });
    expect(http.history.get).toHaveLength(1);
  });

  it.each([200, 403])('ignores late bootstrap metadata/access/toggles (%s) after a newer load', async status => {
    const gate = deferred();
    mockBootstrap(courseId, {
      metadataReply: () => gate.promise,
      homeReply: () => gate.promise.then(([code]) => [code, Factory.build('courseHomeMetadata')]),
      toggleReply: () => gate.promise.then(([code]) => [code, { enable_completion_tracking: false }]),
    });
    const old = store.dispatch(fetchCourse(courseId));
    mockBootstrap('new-course');
    await store.dispatch(fetchCourse('new-course'));
    const current = store.getState();
    gate.resolve([status, metadata]);
    await old;
    expect(store.getState()).toEqual(current);
    expect(store.getState().courseware.courseId).toBe('new-course');
  });

  it('a same-course Retry owns the results even when the original metadata succeeds later', async () => {
    const gate = deferred();
    mockBootstrap(courseId, { metadataReply: () => gate.promise });
    const old = store.dispatch(fetchCourse(courseId));
    mockBootstrap(courseId);
    await store.dispatch(fetchCourse(courseId));
    const current = store.getState();
    gate.resolve([200, { ...metadata, name: 'Stale title' }]);
    await old;
    expect(store.getState()).toEqual(current);
  });

  it('a pending optional sidebar toggle does not block fresh required access/metadata/outline', async () => {
    const gate = deferred();
    mockBootstrap(courseId, { toggleReply: () => gate.promise });
    await store.dispatch(fetchCourse(courseId));
    expect(store.getState().courseware.courseStatus).toBe('loaded');
    expect(store.getState().courseware.coursewareOutlineSidebarSettings).toEqual({});
    gate.resolve([200, { enable_completion_tracking: true }]);
    // Join the actual asynchronous HTTP/then chain without a timing assumption.
    await new Promise(resolve => { setTimeout(resolve, 0); });
    expect(store.getState().courseware.coursewareOutlineSidebarSettings.enableCompletionTracking).toBe(true);
  });

  it.each(['metadata', 'outline', 'access'])('requires fresh %s independently of optional presentation toggles', async dependency => {
    const denied = Factory.build('courseHomeMetadata', { course_access: { has_access: false } });
    mockBootstrap(courseId, {
      metadataReply: dependency === 'metadata' ? () => [403, {}] : undefined,
      outlineReply: dependency === 'outline' ? () => [403, {}] : undefined,
      homeReply: dependency === 'access' ? () => [200, denied] : undefined,
    });
    await store.dispatch(fetchCourse(courseId));
    expect(store.getState().courseware.courseStatus).toBe(dependency === 'metadata' ? 'failed' : 'denied');
  });

  it.each([200, 422])('ignores stale sequence settlement (%s) after a newer sequence', async status => {
    const gate = deferred();
    http.onGet(`${lms}/api/courseware/sequence/old`).reply(() => gate.promise);
    http.onGet(`${lms}/api/courseware/sequence/new`).reply(200, { item_id: 'new', tag: 'sequential', items: [] });
    const old = store.dispatch(fetchSequence('old', false));
    await store.dispatch(fetchSequence('new', true));
    const current = store.getState();
    gate.resolve([status, { item_id: 'old', tag: 'sequential', items: [] }]);
    await old;
    expect(store.getState()).toEqual(current);
    expect(http.history.get[1].params.preview).toBe('1');
    expect(loggingService.logError).not.toHaveBeenCalled();
  });
});
