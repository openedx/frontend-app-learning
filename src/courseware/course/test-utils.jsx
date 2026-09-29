import React from 'react';
import PropTypes from 'prop-types';
import { Factory } from 'rosie';
import { snakeCaseObject } from '@edx/frontend-platform';
import { breakpoints } from '@openedx/paragon';
import { getTestStoreIds, initializeTestStore, render } from '@src/setupTest';
import CourseQueryGate from '@src/tests/CourseQueryGate';
import MountCourseQueryHooks from '@src/tests/MountCourseQueryHooks';
import Course from './Course';

const mockData = {
  nextSequenceHandler: () => {},
  previousSequenceHandler: () => {},
  unitNavigationHandler: () => {},
};

// Course reads both metadata queries on first render, so the tests mount it behind TabPage's gate.
export const LoadedCourse = ({ courseId, ...props }) => (
  <CourseQueryGate courseId={courseId}>
    <Course courseId={courseId} {...props} />
  </CourseQueryGate>
);

LoadedCourse.propTypes = {
  courseId: PropTypes.string.isRequired,
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
      <MountCourseQueryHooks courseId={mockData.courseId} sequenceId={mockData.sequenceId} />
      <LoadedCourse {...mockData} />
    </>,
    { store: testStore, wrapWithRouter: true },
  );
  return { ...wrapper, testStore };
};

export default setupDiscussionSidebar;
