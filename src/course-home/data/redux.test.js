import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

import * as thunks from './thunks';

import { appendBrowserTimezoneToUrl, executeThunk } from '../../utils';

import { initializeMockApp } from '../../setupTest';
import initializeStore from '../../store';

const { loggingService } = initializeMockApp();

const axiosMock = new MockAdapter(getAuthenticatedHttpClient());

describe('Data layer integration tests', () => {
  const courseHomeMetadata = Factory.build('courseHomeMetadata');
  const { id: courseId } = courseHomeMetadata;
  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

  let store;

  beforeEach(() => {
    axiosMock.reset();
    loggingService.logError.mockReset();

    store = initializeStore();
  });

  describe('Test fetchDatesTab', () => {
    const datesBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/dates`;

    it('Should fail to fetch if error occurs', async () => {
      axiosMock.onGet(courseMetadataUrl).networkError();
      axiosMock.onGet(`${datesBaseUrl}/${courseId}`).networkError();

      await executeThunk(thunks.fetchDatesTab(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseHome.courseStatus).toEqual('failed');
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const datesTabData = Factory.build('datesTabData');

      const datesUrl = `${datesBaseUrl}/${courseId}`;

      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(datesUrl).reply(200, datesTabData);

      await executeThunk(thunks.fetchDatesTab(courseId), store.dispatch);

      const state = store.getState();
      expect(state.courseHome.courseStatus).toEqual('loaded');
      expect(state).toMatchSnapshot();
    });
  });

  describe('Test fetchOutlineTab', () => {
    const outlineBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/outline`;

    it('Should result in fetch failure if error occurs', async () => {
      axiosMock.onGet(courseMetadataUrl).networkError();
      axiosMock.onGet(`${outlineBaseUrl}/${courseId}`).networkError();

      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseHome.courseStatus).toEqual('failed');
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const outlineTabData = Factory.build('outlineTabData', { courseId });

      const outlineUrl = `${outlineBaseUrl}/${courseId}`;

      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(outlineUrl).reply(200, outlineTabData);

      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      const state = store.getState();
      expect(state.courseHome.courseStatus).toEqual('loaded');
      expect(state).toMatchSnapshot();
    });
  });

  describe('Test fetchProgressTab', () => {
    const progressBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/progress`;

    it('Should result in fetch failure if error occurs', async () => {
      axiosMock.onGet(courseMetadataUrl).networkError();
      axiosMock.onGet(`${progressBaseUrl}/${courseId}`).networkError();

      await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseHome.courseStatus).toEqual('failed');
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const progressTabData = Factory.build('progressTabData', { courseId });

      const progressUrl = `${progressBaseUrl}/${courseId}`;

      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(progressUrl).reply(200, progressTabData);

      await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);

      const state = store.getState();
      expect(state.courseHome.courseStatus).toEqual('loaded');
      expect(state).toMatchSnapshot();
    });

    it('Should handle the url including a targetUserId', async () => {
      const progressTabData = Factory.build('progressTabData', { courseId });
      const targetUserId = 2;
      const progressUrl = `${progressBaseUrl}/${courseId}/${targetUserId}/`;

      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(progressUrl).reply(200, progressTabData);

      await executeThunk(thunks.fetchProgressTab(courseId, 2), store.dispatch);

      const state = store.getState();
      expect(state.courseHome.targetUserId).toEqual(2);
    });
  });

  describe('Test saveCourseGoal', () => {
    it('Should save course goal', async () => {
      const goalUrl = `${getConfig().LMS_BASE_URL}/api/course_home/save_course_goal`;
      axiosMock.onPost(goalUrl).reply(200, {});

      await thunks.deprecatedSaveCourseGoal(courseId, 'unsure');

      expect(axiosMock.history.post[0].url).toEqual(goalUrl);
      expect(axiosMock.history.post[0].data).toEqual(`{"course_id":"${courseId}","goal_key":"unsure"}`);
    });
  });

  describe('Test resetDeadlines', () => {
    it('Should reset course deadlines', async () => {
      const resetUrl = `${getConfig().LMS_BASE_URL}/api/course_experience/v1/reset_course_deadlines`;
      const model = 'dates';
      axiosMock.onPost(resetUrl).reply(201, {});

      const getTabDataMock = jest.fn(() => ({
        type: 'MOCK_ACTION',
      }));

      await executeThunk(thunks.resetDeadlines(courseId, model, getTabDataMock), store.dispatch);

      expect(axiosMock.history.post[0].url).toEqual(resetUrl);
      expect(axiosMock.history.post[0].data).toEqual(`{"course_key":"${courseId}","research_event_data":{"location":"dates-tab"}}`);

      expect(getTabDataMock).toHaveBeenCalledWith(courseId);
    });
  });

  describe('Test dismissWelcomeMessage', () => {
    it('Should dismiss welcome message', async () => {
      const dismissUrl = `${getConfig().LMS_BASE_URL}/api/course_home/dismiss_welcome_message`;
      axiosMock.onPost(dismissUrl).reply(201);

      await executeThunk(thunks.dismissWelcomeMessage(courseId), store.dispatch);

      expect(axiosMock.history.post[0].url).toEqual(dismissUrl);
      expect(axiosMock.history.post[0].data).toEqual(`{"course_id":"${courseId}"}`);
    });
  });
});
