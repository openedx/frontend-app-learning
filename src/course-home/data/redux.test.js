import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

import * as thunks from './thunks';

import executeThunk from '../../utils';

import initializeMockApp from '../../setupTest';
import initializeStore from '../../store';
import { LOADING, FAILED } from '../../course';

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
    expect(store.getState().activeCourse.courseId).toBeNull();
    expect(store.getState().activeCourse.courseStatus).toEqual(LOADING);
  });

  describe('Test fetchDatesTab', () => {
    const datesBaseUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/dates`;

    it('Should fail to fetch if error occurs', async () => {
      axiosMock.onGet(courseUrl).networkError();
      axiosMock.onGet(courseMetadataUrl).networkError();
      axiosMock.onGet(`${datesBaseUrl}/${courseId}`).networkError();

      await executeThunk(thunks.fetchDatesTab(courseId), store.dispatch);

      expect(loggingService.logError).toHaveBeenCalled();
      expect(store.getState().activeCourse.courseStatus).toEqual(FAILED);
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const datesTabData = Factory.build('datesTabData');

      const datesUrl = `${datesBaseUrl}/${courseId}`;

      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(datesUrl).reply(200, datesTabData);

      await executeThunk(thunks.fetchDatesTab(courseId), store.dispatch);

      const state = store.getState();
      expect(state.activeCourse.courseStatus).toEqual('loaded');
      expect(state.activeCourse.courseId).toEqual(courseId);
      expect(state.courseHome.displayResetDatesToast).toBe(false);

      // Validate course
      const course = state.models.courses[courseId];
      const expectedFieldCount = Object.keys(course).length;
      // If this breaks, you should consider adding assertions below for the new data.  If it's not
      // an "interesting" addition, just bump the number anyway.
      expect(expectedFieldCount).toBe(9);
      expect(course.title).toEqual(courseHomeMetadata.title);

      // Representative sample of data that proves data normalization and ingestion happened.
      expect(course.id).toEqual(courseId);
      expect(course.isStaff).toBe(courseHomeMetadata.is_staff);
      expect(course.number).toEqual(courseHomeMetadata.number);
      expect(Array.isArray(course.tabs)).toBe(true);
      expect(course.tabs.length).toBe(5); // Weak assertion, but proves the array made it through.

      // This proves the tab type came through as a modelType.  We don't need to assert much else
      // here because the shape of this data is not passed through any sort of normalization scheme,
      // it just gets camelCased.
      const dates = state.models.dates[courseId];
      expect(dates.id).toEqual(courseId);
      expect(dates.verifiedUpgradeLink).toBe(datesTabData.verified_upgrade_link);
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
      expect(store.getState().activeCourse.courseStatus).toEqual('failed');
    });

    it('Should fetch, normalize, and save metadata', async () => {
      const outlineTabData = Factory.build('outlineTabData', { courseId });

      const outlineUrl = `${outlineBaseUrl}/${courseId}`;

      axiosMock.onGet(courseUrl).reply(200, courseMetadata);
      axiosMock.onGet(courseMetadataUrl).reply(200, courseHomeMetadata);
      axiosMock.onGet(outlineUrl).reply(200, outlineTabData);

      await executeThunk(thunks.fetchOutlineTab(courseId), store.dispatch);

      const state = store.getState();
      expect(state.activeCourse.courseStatus).toEqual('loaded');
      expect(state.courseHome.displayResetDatesToast).toBe(false);

      // Validate course
      const course = state.models.courses[courseId];
      const expectedFieldCount = Object.keys(course).length;
      // If this breaks, you should consider adding assertions below for the new data.  If it's not
      // an "interesting" addition, just bump the number anyway.
      expect(expectedFieldCount).toBe(9);
      expect(course.title).toEqual(courseHomeMetadata.title);

      // Representative sample of data that proves data normalization and ingestion happened.
      expect(course.id).toEqual(courseId);
      expect(course.isStaff).toBe(courseHomeMetadata.is_staff);
      expect(course.number).toEqual(courseHomeMetadata.number);
      expect(Array.isArray(course.tabs)).toBe(true);
      expect(course.tabs.length).toBe(5); // Weak assertion, but proves the array made it through.

      // This proves the tab type came through as a modelType.  We don't need to assert much else
      // here because the shape of this data is not passed through any sort of normalization scheme,
      // it just gets camelCased.
      const outline = state.models.outline[courseId];
      expect(outline.id).toEqual(courseId);
      expect(outline.handoutsHtml).toBe(outlineTabData.handouts_html);
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

  describe('Test dismissWelcomeMessage', () => {
    it('Should dismiss welcome message', async () => {
      const dismissUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/dismiss_welcome_message`;
      axiosMock.onPost(dismissUrl).reply(201);

      await executeThunk(thunks.dismissWelcomeMessage(courseId), store.dispatch);

      expect(axiosMock.history.post[0].url).toEqual(dismissUrl);
      expect(axiosMock.history.post[0].data).toEqual(`{"course_id":"${courseId}"}`);
    });
  });
});
