import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

import * as thunks from './thunks';

import { appendBrowserTimezoneToUrl, executeThunk } from '../../utils';

import buildSimpleCourseBlocks from './__factories__/courseBlocks.factory';
import { initializeMockApp } from '../../setupTest';
import initializeStore from '../../store';

const { loggingService } = initializeMockApp();

const axiosMock = new MockAdapter(getAuthenticatedHttpClient());

describe('Data layer integration tests', () => {
  const courseBaseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course`;
  const courseBlocksUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`);
  const sequenceBaseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence`;

  // building minimum set of api responses to test all thunks
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const { courseBlocks, unitBlocks, sequenceBlock } = buildSimpleCourseBlocks(courseId);
  const sequenceMetadata = Factory.build(
    'sequenceMetadata',
    {},
    { courseId, unitBlocks, sequenceBlock: sequenceBlock[0] },
  );

  let courseUrl = `${courseBaseUrl}/${courseId}`;
  courseUrl = appendBrowserTimezoneToUrl(courseUrl);

  const sequenceUrl = `${sequenceBaseUrl}/${sequenceMetadata.item_id}`;
  const sequenceId = sequenceBlock[0].id;
  const unitId = unitBlocks[0].id;

  let store;

  beforeEach(() => {
    axiosMock.reset();
    loggingService.logError.mockReset();

    store = initializeStore();
  });

  describe('Test fetchCourse', () => {
    it('Should fail to fetch course and blocks if request error happens', async () => {
      axiosMock.onGet(courseUrl).networkError();
      axiosMock.onGet(courseBlocksUrlRegExp).networkError();

      await executeThunk(thunks.fetchCourse(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseware).toEqual(expect.objectContaining({
        courseId,
        courseStatus: 'failed',
      }));
    });

    it('Should fetch, normalize, and save metadata, but with denied status', async () => {
      const forbiddenCourseMetadata = Factory.build('courseMetadata', {
        can_load_courseware: {
          has_access: false,
        },
      });
      const forbiddenCourseBlocks = Factory.build('courseBlocks', {
        courseId: forbiddenCourseMetadata.id,
      });

      let forbiddenCourseUrl = `${courseBaseUrl}/${forbiddenCourseMetadata.id}`;
      forbiddenCourseUrl = appendBrowserTimezoneToUrl(forbiddenCourseUrl);

      axiosMock.onGet(forbiddenCourseUrl).reply(200, forbiddenCourseMetadata);
      axiosMock.onGet(courseBlocksUrlRegExp).reply(200, forbiddenCourseBlocks);

      await executeThunk(thunks.fetchCourse(forbiddenCourseMetadata.id), store.dispatch);

      const state = store.getState();

      expect(state.courseware.courseStatus).toEqual('denied');

      // check that at least one key camel cased, thus course data normalized
      expect(state.models.coursewareMeta[forbiddenCourseMetadata.id].canLoadCourseware).not.toBeUndefined();
    });

    it('Should fetch, normalize, and save metadata', async () => {
      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);

      await executeThunk(thunks.fetchCourse(courseId), store.dispatch);

      const state = store.getState();

      expect(state.courseware.courseStatus).toEqual('loaded');
      expect(state.courseware.courseId).toEqual(courseId);
      expect(state.courseware.sequenceStatus).toEqual('loading');
      expect(state.courseware.sequenceId).toEqual(null);

      // check that at least one key camel cased, thus course data normalized
      expect(state.models.coursewareMeta[courseId].canLoadCourseware).not.toBeUndefined();
    });
  });

  describe('Test fetchSequence', () => {
    it('Should result in fetch failure if error occurs', async () => {
      axiosMock.onGet(sequenceUrl).networkError();

      await executeThunk(thunks.fetchSequence(sequenceId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseware.sequenceStatus).toEqual('failed');
    });

    it('Should fetch and normalize metadata, and then update existing models with sequence metadata', async () => {
      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);
      axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);

      // setting course with blocks before sequence to check that blocks receive
      // additional information after fetchSequence call.
      await executeThunk(thunks.fetchCourse(courseId), store.dispatch);

      // ensure that initial state has no additional sequence info
      let state = store.getState();
      expect(state.models.sequences).toEqual({
        [sequenceId]: expect.not.objectContaining({
          gatedContent: expect.any(Object),
          activeUnitIndex: expect.any(Number),
        }),
      });
      expect(state.models.units).toEqual({
        [unitId]: expect.not.objectContaining({
          complete: null,
          bookmarked: expect.any(Boolean),
        }),
      });

      // Update our state variable again.
      state = store.getState();

      expect(state.courseware.courseStatus).toEqual('loaded');
      expect(state.courseware.courseId).toEqual(courseId);
      expect(state.courseware.sequenceStatus).toEqual('loading');
      expect(state.courseware.sequenceId).toEqual(null);

      await executeThunk(thunks.fetchSequence(sequenceId), store.dispatch);

      // Update our state variable again.
      state = store.getState();

      // ensure that additional information appeared in store
      expect(state.models.sequences).toEqual({
        [sequenceId]: expect.objectContaining({
          gatedContent: expect.any(Object),
          activeUnitIndex: expect.any(Number),
        }),
      });
      expect(state.models.units).toEqual({
        [unitId]: expect.objectContaining({
          complete: null,
          bookmarked: expect.any(Boolean),
        }),
      });

      expect(state.courseware.courseStatus).toEqual('loaded');
      expect(state.courseware.courseId).toEqual(courseId);
      expect(state.courseware.sequenceStatus).toEqual('loaded');
      expect(state.courseware.sequenceId).toEqual(sequenceId);
    });
  });

  describe('Thunks that require fetched sequences', () => {
    beforeEach(async () => {
      // thunks tested in this block rely on fact, that store already has
      // some info about sequence
      axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);
      await executeThunk(thunks.fetchSequence(sequenceMetadata.item_id), store.dispatch);
    });

    describe('Test checkBlockCompletion', () => {
      const getCompletionURL = `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler/xmodule_handler/get_completion`;

      it('Should fail to check completion and log error', async () => {
        axiosMock.onPost(getCompletionURL).networkError();

        await executeThunk(
          thunks.checkBlockCompletion(courseId, sequenceId, unitId),
          store.dispatch,
          store.getState,
        );

        expect(loggingService.logError).toHaveBeenCalled();
        expect(axiosMock.history.post[0].url).toEqual(getCompletionURL);
      });

      it('Should update complete field of unit model', async () => {
        axiosMock.onPost(getCompletionURL).reply(201, { complete: true });

        await executeThunk(
          thunks.checkBlockCompletion(courseId, sequenceId, unitId),
          store.dispatch,
          store.getState,
        );

        expect(store.getState().models.units[unitId].complete).toBeTruthy();
      });
    });

    describe('Test saveSequencePosition', () => {
      const gotoPositionURL = `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler/xmodule_handler/goto_position`;

      it('Should change and revert sequence model activeUnitIndex in case of error', async () => {
        axiosMock.onPost(gotoPositionURL).networkError();

        const oldPosition = store.getState().models.sequences[sequenceId].activeUnitIndex;
        const newPosition = 123;

        await executeThunk(
          thunks.saveSequencePosition(courseId, sequenceId, newPosition),
          store.dispatch,
          store.getState,
        );

        expect(loggingService.logError).toHaveBeenCalled();
        expect(axiosMock.history.post[0].url).toEqual(gotoPositionURL);
        expect(store.getState().models.sequences[sequenceId].activeUnitIndex).toEqual(oldPosition);
      });

      it('Should update sequence model activeUnitIndex', async () => {
        axiosMock.onPost(gotoPositionURL).reply(201, {});

        const newPosition = 123;

        await executeThunk(
          thunks.saveSequencePosition(courseId, sequenceId, newPosition),
          store.dispatch,
          store.getState,
        );

        expect(axiosMock.history.post[0].url).toEqual(gotoPositionURL);
        expect(store.getState().models.sequences[sequenceId].activeUnitIndex).toEqual(newPosition);
      });
    });
  });
});
