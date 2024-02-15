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

  const courseHomeAccessDeniedMetadata = Factory.build(
    'courseHomeMetadata',
    {
      id: courseId,
      course_access: {
        has_access: false,
        error_code: 'bad codes',
        additional_context_user_message: 'your Codes Are BAD',
      },
    },
  );

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

    it('should result in fetch failed if course metadata call errored', async () => {
      const datesTabData = Factory.build('datesTabData');
      const datesUrl = `${datesBaseUrl}/${courseId}`;

      axiosMock.onGet(courseMetadataUrl).networkError();
      axiosMock.onGet(datesUrl).reply(200, datesTabData);

      await executeThunk(thunks.fetchDatesTab(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseHome.courseStatus).toEqual('failed');
    });

    it('should result in fetch failed if course metadata call errored', async () => {
      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
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
      expect(state).toMatchSnapshot({
        // The Xpert chatbot (frontend-lib-learning-assistant) generates a unique UUID
        // to keep track of conversations. This causes snapshots to fail, because this UUID
        // is generated on each run of the snapshot. Instead, we use an asymmetric matcher here.
        learningAssistant: expect.objectContaining({
          conversationId: expect.any(String),
        }),
      });
    });

    it.each([401, 403, 404])(
      'should result in fetch denied if course access is denied, regardless of dates API status',
      async (errorStatus) => {
        axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeAccessDeniedMetadata);
        axiosMock.onGet(`${datesBaseUrl}/${courseId}`).reply(errorStatus, {});

        await executeThunk(thunks.fetchDatesTab(courseId), store.dispatch);

        expect(store.getState().courseHome.courseStatus).toEqual('denied');
      },
    );
  });

  describe('Test fetchOutlineTab', () => {
    const outlineBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/outline`;
    const outlineUrl = `${outlineBaseUrl}/${courseId}`;

    it('Should result in fetch failure if error occurs', async () => {
      axiosMock.onGet(courseMetadataUrl).networkError();
      axiosMock.onGet(outlineUrl).networkError();

      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseHome.courseStatus).toEqual('failed');
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const outlineTabData = Factory.build('outlineTabData', { courseId });

      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(outlineUrl).reply(200, outlineTabData);

      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      const state = store.getState();
      expect(state.courseHome.courseStatus).toEqual('loaded');
      expect(state).toMatchSnapshot({
        // The Xpert chatbot (frontend-lib-learning-assistant) generates a unique UUID
        // to keep track of conversations. This causes snapshots to fail, because this UUID
        // is generated on each run of the snapshot. Instead, we use an asymmetric matcher here.
        learningAssistant: expect.objectContaining({
          conversationId: expect.any(String),
        }),
      });
    });

    it.each([401, 403, 404])(
      'should result in fetch denied if course access is denied, regardless of outline API status',
      async (errorStatus) => {
        axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeAccessDeniedMetadata);
        axiosMock.onGet(outlineUrl).reply(errorStatus, {});

        await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

        expect(store.getState().courseHome.courseStatus).toEqual('denied');
      },
    );
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
      expect(state).toMatchSnapshot({
        // The Xpert chatbot (frontend-lib-learning-assistant) generates a unique UUID
        // to keep track of conversations. This causes snapshots to fail, because this UUID
        // is generated on each run of the snapshot. Instead, we use an asymmetric matcher here.
        learningAssistant: expect.objectContaining({
          conversationId: expect.any(String),
        }),
      });
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

    it.each([401, 403, 404])(
      'should result in fetch denied for expected errors and failed for all others',
      async (errorStatus) => {
        const progressUrl = `${progressBaseUrl}/${courseId}`;
        axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeAccessDeniedMetadata);
        axiosMock.onGet(progressUrl).reply(errorStatus, {});

        await executeThunk(thunks.fetchProgressTab(courseId), store.dispatch);

        expect(store.getState().courseHome.courseStatus).toEqual('denied');
      },
    );
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

  describe('Test fetchCoursewareSearchSettings', () => {
    it('Should return enabled as true when enabled', async () => {
      const apiUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/courseware-search/enabled/`;
      axiosMock.onGet(apiUrl).reply(200, { enabled: true });

      const { enabled } = await thunks.fetchCoursewareSearchSettings(courseId);

      expect(axiosMock.history.get[0].url).toEqual(apiUrl);
      expect(enabled).toBe(true);
    });

    it('Should return enabled as false when disabled', async () => {
      const apiUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/courseware-search/enabled/`;
      axiosMock.onGet(apiUrl).reply(200, { enabled: false });

      const { enabled } = await thunks.fetchCoursewareSearchSettings(courseId);

      expect(axiosMock.history.get[0].url).toEqual(apiUrl);
      expect(enabled).toBe(false);
    });

    it('Should return enabled as false on error', async () => {
      const apiUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/courseware-search/enabled/`;
      axiosMock.onGet(apiUrl).networkError();

      const { enabled } = await thunks.fetchCoursewareSearchSettings(courseId);

      expect(axiosMock.history.get[0].url).toEqual(apiUrl);
      expect(enabled).toBe(false);
    });
  });
});
