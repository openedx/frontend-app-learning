import React from 'react';
import { Factory } from 'rosie';
import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import { breakpoints } from '@openedx/paragon';
import {
  createTestQueryClient, getTestStoreIds, initializeTestStore, render,
} from '@src/setupTest';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import MountCourseQueryHooks from '@src/tests/MountCourseQueryHooks';
import { buildTopicsFromUnits } from '../data/__factories__/discussionTopics.factory';
import { discussionTopicsQuery } from '../data/apiHooks';
import Course from './Course';

const mockData = {
  nextSequenceHandler: () => {},
  previousSequenceHandler: () => {},
  unitNavigationHandler: () => {},
};

// Seed the discussionTopics model through the real query, against
// temporary mocks of the two discussion endpoints.
const seedDiscussionTopics = async (testStore, courseId, enabledInContext) => {
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`).reply(200, { provider: 'openedx' });
  const topicsResponse = buildTopicsFromUnits(testStore.getState().models.units, enabledInContext);
  axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`)
    .reply(200, topicsResponse);

  await createTestQueryClient(testStore).query(discussionTopicsQuery(courseId));
  axiosMock.restore(); // put the previous adapter back
};

const setupDiscussionSidebar = async (HomeMetaParams) => {
  const params = { verifiedMode: null, enabledInContext: true, ...HomeMetaParams };
  const store = await initializeTestStore();
  const { models } = store.getState();
  const { courseId, sequenceId } = getTestStoreIds(store);
  Object.assign(mockData, {
    courseId,
    sequenceId,
    unitId: Object.values(models.units)[0].id,
  });
  global.innerWidth = breakpoints.extraExtraLarge.minWidth;

  const courseHomeMetadata = Factory.build('courseHomeMetadata', { ...snakeCaseObject(params) });
  const testStore = await initializeTestStore({ provider: 'openedx', courseHomeMetadata });
  const state = testStore.getState();
  await seedDiscussionTopics(testStore, courseId, params.enabledInContext);
  const [firstUnitId] = Object.keys(state.models.units);
  mockData.unitId = firstUnitId;
  mockData.sequenceId = getTestStoreIds(testStore).sequenceId;
  const contextValue = { courseId: mockData.courseId, currentSidebar: null, toggleSidebar: jest.fn() };

  const wrapper = await render(
    <SidebarContext.Provider value={contextValue}>
      <MountCourseQueryHooks courseId={mockData.courseId} />
      <Course {...mockData} />
    </SidebarContext.Provider>,
    { store: testStore, wrapWithRouter: true },
  );
  return { ...wrapper, testStore };
};

export default setupDiscussionSidebar;
