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
    it('Should fail to fetch if error occurs', async () => {
      axiosMock.onGet(`${courseBaseUrl}/courseId`).networkError();
      axiosMock.onGet(courseBlocksUrlRegExp).networkError();

      await executeThunk(thunks.fetchCourse('courseId'), store.dispatch);

      const state = store.getState();
      expect(state.courseware.courseStatus).toEqual('failed');
      expect(state).toMatchSnapshot();
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
      expect(state).toMatchSnapshot();
    });
  });

  describe('Test fetchSequence', () => {
    const sequenceBaseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/sequence`;

    it('Should result in fetch failure if error occurs', async () => {
      axiosMock.onGet(`${sequenceBaseUrl}/sequenceId`).networkError();

      await executeThunk(thunks.fetchSequence('sequenceId'), store.dispatch);

      const state = store.getState();
      expect(state.courseware.sequenceStatus).toEqual('failed');
      expect(state).toMatchSnapshot();
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

      await executeThunk(thunks.fetchCourse(courseMetadata.id), store.dispatch);
      await executeThunk(thunks.fetchSequence(sequenceBlock.id), store.dispatch);

      const state = store.getState();
      expect(state.courseware.sequenceStatus).toEqual('loaded');
      expect(state).toMatchSnapshot();
    });
  });
});
