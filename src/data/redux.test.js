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

import {
  fetchCourse,
  fetchDatesTab,
  fetchOutlineTab,
} from './thunks';

import { reducer as coursewareReducer } from './slice';
import { reducer as modelsReducer } from '../model-store';

import './__factories__';

jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));
jest.mock('@edx/frontend-platform/auth');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
getAuthenticatedUser.mockReturnValue({ username: 'edx' });

// Helper, that is used to forcibly finalize all promises
// in thunk before running matcher against state.
const executeThunk = async (thunk, dispatch) => {
  await thunk(dispatch);
  await new Promise(setImmediate);
};

describe('Test thunks', () => {
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
  const courseMetadataBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata`;

  describe('Test fetchCourse', () => {
    const courseBlocksUrlRegExp = new RegExp(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/*`);

    it('Should fail to fetch if error occurs', async () => {
      axiosMock.onGet(`${courseBaseUrl}/courseId`).networkError();
      axiosMock.onGet(courseBlocksUrlRegExp).networkError();

      await executeThunk(fetchCourse('courseId'), store.dispatch);

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

      await executeThunk(fetchCourse(courseMetadata.id), store.dispatch);

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

      await executeThunk(fetchCourse(courseMetadata.id), store.dispatch);

      const state = store.getState();
      expect(state.courseware.courseStatus).toEqual('loaded');
      expect(state).toMatchSnapshot();
    });
  });

  describe('Test fetchDatesTab', () => {
    const datesBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/dates`;

    it('Should fail to fetch if error occurs', async () => {
      axiosMock.onGet(`${courseBaseUrl}/courseId`).networkError();
      axiosMock.onGet(`${courseMetadataBaseUrl}/courseId`).networkError();
      axiosMock.onGet(`${datesBaseUrl}/courseId`).networkError();

      await executeThunk(fetchDatesTab('courseId'), store.dispatch);

      const state = store.getState();
      expect(state.courseware.courseStatus).toEqual('failed');
      expect(state).toMatchSnapshot();
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const courseMetadata = Factory.build('courseMetadata');
      const courseHomeMetadata = Factory.build(
        'courseHomeMetadata', {
          course_id: courseMetadata.id,
        },
        { courseTabs: courseMetadata.tabs },
      );
      const datesTabData = Factory.build('datesTabData');

      const courseUrl = `${courseBaseUrl}/${courseMetadata.id}`;
      const courseMetadataUrl = `${courseMetadataBaseUrl}/${courseMetadata.id}`;
      const datesUrl = `${datesBaseUrl}/${courseMetadata.id}`;

      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(datesUrl).reply(200, datesTabData);

      await executeThunk(fetchDatesTab(courseMetadata.id), store.dispatch);

      const state = store.getState();
      expect(state.courseware.courseStatus).toEqual('loaded');
      expect(state).toMatchSnapshot();
    });
  });

  describe('Test fetchOutlineTab', () => {
    const outlineBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/outline`;

    it('Should result in fetch failure if error occurs', async () => {
      axiosMock.onGet(`${courseBaseUrl}/courseId`).networkError();
      axiosMock.onGet(`${courseMetadataBaseUrl}/courseId`).networkError();
      axiosMock.onGet(`${outlineBaseUrl}/courseId`).networkError();

      await executeThunk(fetchOutlineTab('courseId'), store.dispatch);

      const state = store.getState();
      expect(state.courseware.courseStatus).toEqual('failed');
      expect(state).toMatchSnapshot();
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const courseMetadata = Factory.build('courseMetadata');
      const courseHomeMetadata = Factory.build(
        'courseHomeMetadata', {
          course_id: courseMetadata.id,
        },
        { courseTabs: courseMetadata.tabs },
      );
      const outlineTabData = Factory.build('outlineTabData', { courseId: courseMetadata.id });

      const courseUrl = `${courseBaseUrl}/${courseMetadata.id}`;
      const courseMetadataUrl = `${courseMetadataBaseUrl}/${courseMetadata.id}`;
      const outlineUrl = `${outlineBaseUrl}/${courseMetadata.id}`;

      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(outlineUrl).reply(200, outlineTabData);

      await executeThunk(fetchOutlineTab(courseMetadata.id), store.dispatch);

      const state = store.getState();
      expect(state.courseware.courseStatus).toEqual('loaded');
      expect(state).toMatchSnapshot();
    });
  });

  describe('Test fetchSequence', () => {
    it('Should result in fetch failure if error occurs', async () => {
      console.log('TBD');
    });

    it('Should fetch and normalize metadata, and then update existing models', async () => {
      console.log('TBD');
    });
  });

  describe('Test resetDeadlines', () => {
    it('Should reset course deadlines', async () => {
      console.log('TBD');
    });
  });
});
