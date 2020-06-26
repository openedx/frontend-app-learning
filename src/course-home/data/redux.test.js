import axios from 'axios'; // eslint-disable-line import/no-extraneous-dependencies
import { configureStore } from '@reduxjs/toolkit';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import * as thunks from './thunks';

import executeThunk from '../../utils';

import { reducer as courseHomeReducer } from './slice';
import { reducer as coursewareReducer } from '../../data/slice';
import { reducer as modelsReducer } from '../../model-store';

import '../../data/__factories__';

jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));
jest.mock('@edx/frontend-platform/auth');

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);


describe('Data layer integration tests', () => {
  let store;

  const courseId = 'courseId';
  const courseBaseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course`;
  const courseMetadataBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata`;

  beforeEach(() => {
    axiosMock.reset();
    logError.mockReset();

    store = configureStore({
      reducer: {
        models: modelsReducer,
        courseware: coursewareReducer,
        courseHome: courseHomeReducer,
      },
    });
  });

  it('Should initialize store', () => {
    expect(store.getState()).toMatchSnapshot();
  });

  describe('Test fetchDatesTab', () => {
    const datesBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/dates`;

    it('Should fail to fetch if error occurs', async () => {
      axiosMock.onGet(`${courseBaseUrl}/${courseId}`).networkError();
      axiosMock.onGet(`${courseMetadataBaseUrl}/${courseId}`).networkError();
      axiosMock.onGet(`${datesBaseUrl}/${courseId}`).networkError();

      await executeThunk(thunks.fetchDatesTab(courseId), store.dispatch);

      expect(logError).toHaveBeenCalled();
      expect(store.getState().courseHome.courseStatus).toEqual('failed');
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

      await executeThunk(thunks.fetchDatesTab(courseMetadata.id), store.dispatch);

      const state = store.getState();
      expect(state.courseHome.courseStatus).toEqual('loaded');
      expect(state).toMatchSnapshot();
    });
  });

  describe('Test fetchOutlineTab', () => {
    const outlineBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/outline`;

    it('Should result in fetch failure if error occurs', async () => {
      axiosMock.onGet(`${courseBaseUrl}/${courseId}`).networkError();
      axiosMock.onGet(`${courseMetadataBaseUrl}/${courseId}`).networkError();
      axiosMock.onGet(`${outlineBaseUrl}/${courseId}`).networkError();

      await executeThunk(thunks.fetchOutlineTab('courseId'), store.dispatch);

      expect(logError).toHaveBeenCalled();
      expect(store.getState().courseHome.courseStatus).toEqual('failed');
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

      await executeThunk(thunks.fetchOutlineTab(courseMetadata.id), store.dispatch);

      const state = store.getState();
      expect(state.courseHome.courseStatus).toEqual('loaded');
      expect(state).toMatchSnapshot();
    });
  });

  describe('Test resetDeadlines', () => {
    it('Should reset course deadlines', async () => {
      const resetUrl = `${getConfig().LMS_BASE_URL}/api/course_experience/v1/reset_course_deadlines`;
      axiosMock.onPost(resetUrl).reply(201);

      const getTabDataMock = jest.fn(() => ({
        type: 'MOCK_ACTION',
      }));

      await executeThunk(thunks.resetDeadlines(courseId, getTabDataMock), store.dispatch);

      expect(axiosMock.history.post[0].url).toEqual(resetUrl);
      expect(axiosMock.history.post[0].data).toEqual(`{"course_key":"${courseId}"}`);

      expect(getTabDataMock).toHaveBeenCalledWith(courseId);
    });
  });
});
