import { configureStore } from '@reduxjs/toolkit';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { configure, getAuthenticatedHttpClient, MockAuthService } from '@edx/frontend-platform/auth';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import * as thunks from './thunks';

import executeThunk from '../utils';

import { reducer as coursewareReducer } from './slice';
import { reducer as modelsReducer } from '../model-store';

import './__factories__';

jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));

mergeConfig({
  authenticatedUser: {
    userId: 'abc123',
    username: 'Mock User',
    roles: [],
    administrator: false,
  },
});
configure(MockAuthService, {
  config: getConfig(),
  loggingService: {
    logInfo: jest.fn(),
    logError: jest.fn(),
  },
});

const axiosMock = new MockAdapter(getAuthenticatedHttpClient());


describe('Data layer integration tests', () => {
  let store;

  const courseBaseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course`;
  const courseBlocksUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`);

  beforeEach(() => {
    axiosMock.reset();
    logError.mockReset();

    store = configureStore({
      reducer: {
        models: modelsReducer,
        courseware: coursewareReducer,
      },
    });
  });

  describe('Test fetchCourse', () => {
    it('Should fail to fetch course and blocks if request error happens', async () => {
      const courseId = 'courseId';

      axiosMock.onGet(`${courseBaseUrl}/${courseId}`).networkError();
      axiosMock.onGet(courseBlocksUrlRegExp).networkError();

      await executeThunk(thunks.fetchCourse(courseId), store.dispatch);

      expect(logError).toHaveBeenCalled();
      expect(store.getState().courseware).toEqual(expect.objectContaining({
        courseId,
        courseStatus: 'failed',
      }));
    });

    it('Should fetch, normalize, and save metadata, but with denied status', async () => {
      const courseMetadata = Factory.build('courseMetadata', {
        can_load_courseware: {
          has_access: false,
        },
      });
      const courseBlocks = Factory.build('courseBlocks', { courseId: courseMetadata.id });

      const courseUrl = `${courseBaseUrl}/${courseMetadata.id}`;

      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);

      await executeThunk(thunks.fetchCourse(courseMetadata.id), store.dispatch);

      const state = store.getState();

      expect(state.courseware.courseStatus).toEqual('denied');

      // check that at least one key camel cased, thus course data normalized
      expect(state.models.courses[courseMetadata.id].canLoadCourseware).not.toBeUndefined();

      expect(state).toMatchSnapshot();
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const courseMetadata = Factory.build('courseMetadata');
      const courseBlocks = Factory.build('courseBlocks', { courseId: courseMetadata.id });

      const courseUrl = `${courseBaseUrl}/${courseMetadata.id}`;

      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);

      await executeThunk(thunks.fetchCourse(courseMetadata.id), store.dispatch);

      const state = store.getState();

      expect(state.courseware.courseStatus).toEqual('loaded');

      // check that at least one key camel cased, thus course data normalized
      expect(state.models.courses[courseMetadata.id].canLoadCourseware).not.toBeUndefined();

      expect(state).toMatchSnapshot();
    });
  });

  describe('Test fetchSequence', () => {
    const sequenceBaseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence`;

    it('Should result in fetch failure if error occurs', async () => {
      axiosMock.onGet(`${sequenceBaseUrl}/sequenceId`).networkError();

      await executeThunk(thunks.fetchSequence('sequenceId'), store.dispatch);

      expect(logError).toHaveBeenCalled();
      expect(store.getState().courseware.sequenceStatus).toEqual('failed');
    });

    it('Should fetch and normalize metadata, and then update existing models with sequence metadata', async () => {
      // creating sequence metadata, that has correct links to blocks
      const courseMetadata = Factory.build('courseMetadata');
      const unitBlock = Factory.build(
        'block',
        { type: 'vertical' },
        { courseId: courseMetadata.id },
      );
      const sequenceBlock = Factory.build(
        'block',
        { type: 'sequential', children: [unitBlock.id] },
        { courseId: courseMetadata.id },
      );
      const courseBlocks = Factory.build(
        'courseBlocks',
        { courseId: courseMetadata.id },
        { unit: unitBlock, sequence: sequenceBlock },
      );
      const sequenceMetadata = Factory.build(
        'sequenceMetadata',
        { courseId: courseMetadata.id },
        { unitBlock, sequenceBlock },
      );

      const courseUrl = `${courseBaseUrl}/${courseMetadata.id}`;
      const sequenceUrl = `${sequenceBaseUrl}/${sequenceBlock.id}`;

      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseBlocksUrlRegExp).reply(200, courseBlocks);
      axiosMock.onGet(sequenceUrl).reply(200, sequenceMetadata);

      // setting course with blocks before sequence to check that blocks receive
      // additional information after fetchSequence call.
      await executeThunk(thunks.fetchCourse(courseMetadata.id), store.dispatch);

      // ensure that initial state has no additional sequence info
      const initialState = store.getState();
      expect(initialState.models.sequences).toEqual({
        [sequenceBlock.id]: expect.not.objectContaining({
          gatedContent: expect.any(Object),
          activeUnitIndex: expect.any(Number),
        }),
      });
      expect(initialState.models.units).toEqual({
        [unitBlock.id]: expect.not.objectContaining({
          complete: null,
          bookmarked: expect.any(Boolean),
        }),
      });

      await executeThunk(thunks.fetchSequence(sequenceBlock.id), store.dispatch);

      const state = store.getState();

      expect(state.courseware.sequenceStatus).toEqual('loaded');

      // ensure that additional information appeared in store
      expect(state.models.sequences).toEqual({
        [sequenceBlock.id]: expect.objectContaining({
          gatedContent: expect.any(Object),
          activeUnitIndex: expect.any(Number),
        }),
      });
      expect(state.models.units).toEqual({
        [unitBlock.id]: expect.objectContaining({
          complete: null,
          bookmarked: expect.any(Boolean),
        }),
      });

      expect(state).toMatchSnapshot();
    });
  });
});
