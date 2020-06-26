import axios from 'axios'; // eslint-disable-line import/no-extraneous-dependencies
import { configureStore } from '@reduxjs/toolkit';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import {
  getAuthenticatedHttpClient,
  getAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import * as thunks from './thunks';

import executeThunk from '../utils';

import { reducer as coursewareReducer } from './slice';
import { reducer as modelsReducer } from '../model-store';

import './__factories__';

jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));
jest.mock('@edx/frontend-platform/auth');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
getAuthenticatedUser.mockReturnValue({ username: 'edx' });


describe('Data layer integration tests', () => {
  let store;

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

  const courseBaseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course`;
  const courseBlocksUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`);

  describe('Test fetchCourse', () => {
    it('Should fail to fetch course and blocks if request error happens', async () => {
      const courseId = 'courseId';

      axiosMock.onGet(`${courseBaseUrl}/${courseId}`).networkError();
      axiosMock.onGet(courseBlocksUrlRegExp).networkError();

      await executeThunk(thunks.fetchCourse(courseId), store.dispatch);

      const state = store.getState();

      expect(logError).toHaveBeenCalled();
      expect(state.courseware).toEqual(expect.objectContaining({
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

      // check that all actions reduced, but access denied
      expect(state).toEqual(expect.objectContaining({
        models: expect.objectContaining({
          courses: expect.any(Object),
          sections: expect.any(Object),
          sequences: expect.any(Object),
          units: expect.any(Object),
        }),
        courseware: expect.objectContaining({
          courseId: courseMetadata.id,
          courseStatus: 'denied',
        }),
      }));

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

      // check that all actions reduced
      expect(state).toEqual(expect.objectContaining({
        models: expect.objectContaining({
          courses: expect.any(Object),
          sections: expect.any(Object),
          sequences: expect.any(Object),
          units: expect.any(Object),
        }),
        courseware: expect.objectContaining({
          courseId: courseMetadata.id,
          courseStatus: 'loaded',
        }),
      }));

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

      const state = store.getState();
      expect(logError).toHaveBeenCalled();
      expect(state.courseware.sequenceStatus).toEqual('failed');
    });

    it('Should fetch and normalize metadata, and then update existing models', async () => {
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
      expect(store.getState().models.sequences).toEqual({
        [sequenceBlock.id]: expect.not.objectContaining({
          gatedContent: expect.any(Object),
          activeUnitIndex: expect.any(Number),
        }),
      });
      expect(store.getState().models.units).toEqual({
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
