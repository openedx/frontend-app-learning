import React from 'react';
import { Factory } from 'rosie';
import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import { breakpoints } from '@openedx/paragon';
import { executeThunk } from '@src/utils';
import { initializeTestStore, render } from '@src/setupTest';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import { buildTopicsFromUnits } from '../data/__factories__/discussionTopics.factory';
import * as thunks from '../data/thunks';
import Course from './Course';

const mockData = {
  nextSequenceHandler: () => {},
  previousSequenceHandler: () => {},
  unitNavigationHandler: () => {},
};

const setupDiscussionSidebar = async (HomeMetaParams) => {
  const params = { verifiedMode: null, enabledInContext: true, ...HomeMetaParams };
  const store = await initializeTestStore();
  const { courseware, models } = store.getState();
  const { courseId, sequenceId } = courseware;
  Object.assign(mockData, {
    courseId,
    sequenceId,
    unitId: Object.values(models.units)[0].id,
  });
  global.innerWidth = breakpoints.extraExtraLarge.minWidth;

  const courseHomeMetadata = Factory.build('courseHomeMetadata', { ...snakeCaseObject(params) });
  const testStore = await initializeTestStore({ provider: 'openedx', courseHomeMetadata });
  const state = testStore.getState();
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`).reply(200, { provider: 'openedx' });
  const topicsResponse = buildTopicsFromUnits(state.models.units, params.enabledInContext);
  axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`)
    .reply(200, topicsResponse);

  await executeThunk(thunks.getCourseDiscussionTopics(courseId), testStore.dispatch);
  const [firstUnitId] = Object.keys(state.models.units);
  mockData.unitId = firstUnitId;
  const [firstSequenceId] = Object.keys(state.models.sequences);
  mockData.sequenceId = firstSequenceId;
  const contextValue = { courseId: mockData.courseId, currentSidebar: null, toggleSidebar: jest.fn() };

  const wrapper = await render(
    <SidebarContext.Provider value={contextValue}>
      <Course {...mockData} />
    </SidebarContext.Provider>,
    { store: testStore, wrapWithRouter: true },
  );
  return wrapper;
};

export default setupDiscussionSidebar;
