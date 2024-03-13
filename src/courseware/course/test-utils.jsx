import React from 'react';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import { breakpoints } from '@openedx/paragon';
import { initializeTestStore, render } from '../../setupTest';
import { buildTopicsFromUnits } from '../data/__factories__/discussionTopics.factory';
import { executeThunk } from '../../utils';
import * as thunks from '../data/thunks';
import Course from './Course';

const mockData = {
  nextSequenceHandler: () => {},
  previousSequenceHandler: () => {},
  unitNavigationHandler: () => {},
};

const setupDiscussionSidebar = async (verifiedMode = null, enabledInContext = true) => {
  const store = await initializeTestStore();
  const { courseware, models } = store.getState();
  const { courseId, sequenceId } = courseware;
  Object.assign(mockData, {
    courseId,
    sequenceId,
    unitId: Object.values(models.units)[0].id,
  });
  global.innerWidth = breakpoints.extraExtraLarge.minWidth;

  const courseHomeMetadata = Factory.build('courseHomeMetadata', { verified_mode: verifiedMode });
  const testStore = await initializeTestStore({ provider: 'openedx', courseHomeMetadata });
  const state = testStore.getState();
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`).reply(200, { provider: 'openedx' });
  const topicsResponse = buildTopicsFromUnits(state.models.units, enabledInContext);
  axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`)
    .reply(200, topicsResponse);

  await executeThunk(thunks.getCourseDiscussionTopics(courseId), testStore.dispatch);
  const [firstUnitId] = Object.keys(state.models.units);
  mockData.unitId = firstUnitId;
  const [firstSequenceId] = Object.keys(state.models.sequences);
  mockData.sequenceId = firstSequenceId;

  const wrapper = await render(<Course {...mockData} />, { store: testStore, wrapWithRouter: true });
  return wrapper;
};

export default setupDiscussionSidebar;
