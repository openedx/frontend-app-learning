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

  describe('Test saveCourseGoal', () => {
    it('Should save course goal', async () => {
      const goalUrl = `${getConfig().LMS_BASE_URL}/api/course_home/save_course_goal`;
      axiosMock.onPost(goalUrl).reply(200, {});

      await thunks.deprecatedSaveCourseGoal(courseId, 'unsure');

      expect(axiosMock.history.post[0].url).toEqual(goalUrl);
      expect(axiosMock.history.post[0].data).toEqual(`{"course_id":"${courseId}","goal_key":"unsure"}`);
    });
  });

  describe('Test fetchExamAttemptsData', () => {
    const sequenceIds = [
      'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345',
      'block-v1:edX+DemoX+Demo_Course+type@sequential+block@67890',
      'block-v1:edX+DemoX+Demo_Course+type@sequential+block@abcde',
    ];

    beforeEach(() => {
      // Mock individual exam endpoints with different responses
      sequenceIds.forEach((sequenceId, index) => {
        // Handle both LMS and EXAMS service URL patterns
        const lmsExamUrl = new RegExp(`.*edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}.*content_id=${encodeURIComponent(sequenceId)}.*`);
        const examsServiceUrl = new RegExp(`.*/api/v1/student/exam/attempt/course_id/${encodeURIComponent(courseId)}/content_id/${encodeURIComponent(sequenceId)}.*`);

        let attemptStatus = 'ready_to_start';
        if (index === 0) {
          attemptStatus = 'created';
        } else if (index === 1) {
          attemptStatus = 'submitted';
        }

        const mockExamData = {
          exam: {
            id: index + 1,
            course_id: courseId,
            content_id: sequenceId,
            exam_name: `Test Exam ${index + 1}`,
            attempt_status: attemptStatus,
            time_remaining_seconds: 3600,
          },
        };

        // Mock both URL patterns
        axiosMock.onGet(lmsExamUrl).reply(200, mockExamData);
        axiosMock.onGet(examsServiceUrl).reply(200, mockExamData);
      });
    });

    it('should fetch exam data for all sequence IDs and dispatch setExamsData', async () => {
      await executeThunk(thunks.fetchExamAttemptsData(courseId, sequenceIds), store.dispatch);

      const state = store.getState();

      // Verify the examsData was set in the store
      expect(state.courseHome.examsData).toHaveLength(3);
      expect(state.courseHome.examsData).toEqual([
        {
          id: 1,
          courseId,
          contentId: sequenceIds[0],
          examName: 'Test Exam 1',
          attemptStatus: 'created',
          timeRemainingSeconds: 3600,
        },
        {
          id: 2,
          courseId,
          contentId: sequenceIds[1],
          examName: 'Test Exam 2',
          attemptStatus: 'submitted',
          timeRemainingSeconds: 3600,
        },
        {
          id: 3,
          courseId,
          contentId: sequenceIds[2],
          examName: 'Test Exam 3',
          attemptStatus: 'ready_to_start',
          timeRemainingSeconds: 3600,
        },
      ]);

      // Verify all API calls were made
      expect(axiosMock.history.get).toHaveLength(3);
    });

    it('should handle 404 responses and include empty objects in results', async () => {
      // Override one endpoint to return 404 for both URL patterns
      const examUrl404LMS = new RegExp(`.*edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}.*content_id=${encodeURIComponent(sequenceIds[1])}.*`);
      const examUrl404Exams = new RegExp(`.*/api/v1/student/exam/attempt/course_id/${encodeURIComponent(courseId)}/content_id/${encodeURIComponent(sequenceIds[1])}.*`);
      axiosMock.onGet(examUrl404LMS).reply(404);
      axiosMock.onGet(examUrl404Exams).reply(404);

      await executeThunk(thunks.fetchExamAttemptsData(courseId, sequenceIds), store.dispatch);

      const state = store.getState();

      // Verify the examsData includes empty object for 404 response
      expect(state.courseHome.examsData).toHaveLength(3);
      expect(state.courseHome.examsData[1]).toEqual({});
    });

    it('should handle API errors and log them while continuing with other requests', async () => {
      // Override one endpoint to return 500 error for both URL patterns
      const examUrl500LMS = new RegExp(`.*edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}.*content_id=${encodeURIComponent(sequenceIds[0])}.*`);
      const examUrl500Exams = new RegExp(`.*/api/v1/student/exam/attempt/course_id/${encodeURIComponent(courseId)}/content_id/${encodeURIComponent(sequenceIds[0])}.*`);
      axiosMock.onGet(examUrl500LMS).reply(500, { error: 'Server Error' });
      axiosMock.onGet(examUrl500Exams).reply(500, { error: 'Server Error' });

      await executeThunk(thunks.fetchExamAttemptsData(courseId, sequenceIds), store.dispatch);

      const state = store.getState();

      // Verify error was logged for the failed request
      expect(loggingService.logError).toHaveBeenCalled();

      // Verify the examsData still includes results for successful requests
      expect(state.courseHome.examsData).toHaveLength(3);
      // First item should be the error result (just empty object for API errors)
      expect(state.courseHome.examsData[0]).toEqual({});
    });

    it('should handle empty sequence IDs array', async () => {
      await executeThunk(thunks.fetchExamAttemptsData(courseId, []), store.dispatch);

      const state = store.getState();

      expect(state.courseHome.examsData).toEqual([]);
      expect(axiosMock.history.get).toHaveLength(0);
    });

    it('should handle mixed success and error responses', async () => {
      // Setup mixed responses
      const examUrl1LMS = new RegExp(`.*edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}.*content_id=${encodeURIComponent(sequenceIds[0])}.*`);
      const examUrl1Exams = new RegExp(`.*/api/v1/student/exam/attempt/course_id/${encodeURIComponent(courseId)}/content_id/${encodeURIComponent(sequenceIds[0])}.*`);
      const examUrl2LMS = new RegExp(`.*edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}.*content_id=${encodeURIComponent(sequenceIds[1])}.*`);
      const examUrl2Exams = new RegExp(`.*/api/v1/student/exam/attempt/course_id/${encodeURIComponent(courseId)}/content_id/${encodeURIComponent(sequenceIds[1])}.*`);
      const examUrl3LMS = new RegExp(`.*edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}.*content_id=${encodeURIComponent(sequenceIds[2])}.*`);
      const examUrl3Exams = new RegExp(`.*/api/v1/student/exam/attempt/course_id/${encodeURIComponent(courseId)}/content_id/${encodeURIComponent(sequenceIds[2])}.*`);

      axiosMock.onGet(examUrl1LMS).reply(200, {
        exam: {
          id: 1,
          exam_name: 'Success Exam',
          course_id: courseId,
          content_id: sequenceIds[0],
          attempt_status: 'created',
          time_remaining_seconds: 3600,
        },
      });
      axiosMock.onGet(examUrl1Exams).reply(200, {
        exam: {
          id: 1,
          exam_name: 'Success Exam',
          course_id: courseId,
          content_id: sequenceIds[0],
          attempt_status: 'created',
          time_remaining_seconds: 3600,
        },
      });
      axiosMock.onGet(examUrl2LMS).reply(404);
      axiosMock.onGet(examUrl2Exams).reply(404);
      axiosMock.onGet(examUrl3LMS).reply(500, { error: 'Server Error' });
      axiosMock.onGet(examUrl3Exams).reply(500, { error: 'Server Error' });

      await executeThunk(thunks.fetchExamAttemptsData(courseId, sequenceIds), store.dispatch);

      const state = store.getState();

      expect(state.courseHome.examsData).toHaveLength(3);
      expect(state.courseHome.examsData[0]).toMatchObject({
        id: 1,
        examName: 'Success Exam',
        courseId,
        contentId: sequenceIds[0],
      });
      expect(state.courseHome.examsData[1]).toEqual({});
      expect(state.courseHome.examsData[2]).toEqual({});

      // Verify error was logged for the 500 error (may be called more than once due to multiple URL patterns)
      expect(loggingService.logError).toHaveBeenCalled();
    });
  });

  describe('Test fetchTab', () => {
    const liveUrl = `${getConfig().LMS_BASE_URL}/api/course_live/iframe/${courseId}/`;

    it('Should fetch metadata + tab data and mark the tab loaded', async () => {
      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(liveUrl).reply(200, { iframe: 'https://example.com/live' });

      await executeThunk(thunks.fetchLiveTab(courseId), store.dispatch);

      expect(store.getState().courseHome.courseStatus).toEqual('loaded');
    });

    it('Should result in denied when the learner lacks course access', async () => {
      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeAccessDeniedMetadata);
      axiosMock.onGet(liveUrl).reply(200, {});

      await executeThunk(thunks.fetchLiveTab(courseId), store.dispatch);

      expect(store.getState().courseHome.courseStatus).toEqual('denied');
    });

    it('Should result in failure when the metadata request errors', async () => {
      axiosMock.onGet(courseMetadataUrl).networkError();
      axiosMock.onGet(liveUrl).reply(200, {});

      await executeThunk(thunks.fetchLiveTab(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().courseHome.courseStatus).toEqual('failed');
    });

    it('Should result in failure when the tab data request errors', async () => {
      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(liveUrl).reply(500);

      await executeThunk(thunks.fetchLiveTab(courseId), store.dispatch);

      expect(store.getState().courseHome.courseStatus).toEqual('failed');
    });
  });
});
