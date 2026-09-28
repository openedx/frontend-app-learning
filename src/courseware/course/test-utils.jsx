import React from 'react';
import { Factory } from 'rosie';
import { snakeCaseObject } from '@edx/frontend-platform';
import { breakpoints } from '@openedx/paragon';
import { getTestStoreIds, initializeTestStore, render } from '@src/setupTest';
import MountCourseQueryHooks from '@src/tests/MountCourseQueryHooks';
import Course from './Course';

const mockData = {
  nextSequenceHandler: () => {},
  previousSequenceHandler: () => {},
  unitNavigationHandler: () => {},
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
  const testStore = await initializeTestStore({
    provider: 'openedx', enabledInContext: params.enabledInContext, courseHomeMetadata,
  });
  const state = testStore.getState();
  const [firstUnitId] = Object.keys(state.models.units);
  mockData.unitId = firstUnitId;
  mockData.sequenceId = getTestStoreIds(testStore).sequenceId;
  const wrapper = await render(
    <>
      <MountCourseQueryHooks courseId={mockData.courseId} />
      <Course {...mockData} />
    </>,
    { store: testStore, wrapWithRouter: true },
  );
  return { ...wrapper, testStore };
};

export default setupDiscussionSidebar;
