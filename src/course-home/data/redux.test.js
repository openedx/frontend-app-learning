import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

import * as thunks from './thunks';

import executeThunk from '../../utils';

import './__factories__';
import '../../courseware/data/__factories__/courseMetadata.factory';
import initializeMockApp from '../../setupTest';
import initializeStore from '../../store';

const { loggingService } = initializeMockApp();

const axiosMock = new MockAdapter(getAuthenticatedHttpClient());

describe('Data layer integration tests', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseHomeMetadata = Factory.build(
    'courseHomeMetadata', {
      course_id: courseMetadata.id,
    },
    { courseTabs: courseMetadata.tabs },
  );

  const courseId = courseMetadata.id;
  const courseBaseUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course`;
  const courseMetadataBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata`;

  const courseUrl = `${courseBaseUrl}/${courseId}`;
  const courseMetadataUrl = `${courseMetadataBaseUrl}/${courseId}`;

  let store;

  beforeEach(() => {
    axiosMock.reset();
    loggingService.logError.mockReset();

    store = initializeStore();
  });

  it('Should initialize store', () => {
    expect(store.getState()).toMatchSnapshot();
  });

  describe('Test fetchDatesTab', () => {
    const datesBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/dates`;

    it('Should fail to fetch if error occurs', async () => {
      axiosMock.onGet(courseUrl).networkError();
      axiosMock.onGet(courseMetadataUrl).networkError();
      axiosMock.onGet(`${datesBaseUrl}/${courseId}`).networkError();

      await executeThunk(thunks.fetchDatesTab(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseHome.courseStatus).toEqual('failed');
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const datesTabData = Factory.build('datesTabData');

      const datesUrl = `${datesBaseUrl}/${courseId}`;

      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(datesUrl).reply(200, datesTabData);

      await executeThunk(thunks.fetchDatesTab(courseId), store.dispatch);

      const state = store.getState();
      expect(state.courseHome.courseStatus).toEqual('loaded');
      expect(state).toMatchSnapshot();
    });
  });

  describe('Test fetchOutlineTab', () => {
    const outlineBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/outline`;

    it('Should result in fetch failure if error occurs', async () => {
      axiosMock.onGet(courseUrl).networkError();
      axiosMock.onGet(courseMetadataUrl).networkError();
      axiosMock.onGet(`${outlineBaseUrl}/${courseId}`).networkError();

      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseHome.courseStatus).toEqual('failed');
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const outlineTabData = Factory.build('outlineTabData', { courseId });

      const outlineUrl = `${outlineBaseUrl}/${courseId}`;

      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(outlineUrl).reply(200, outlineTabData);

      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

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
