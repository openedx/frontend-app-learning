import React from 'react';
import PropTypes from 'prop-types';
import { Factory } from 'rosie';
import { snakeCaseObject } from '@edx/frontend-platform';
import { breakpoints } from '@openedx/paragon';
import { mockCourseRequests, render } from '@src/setupTest';
import initializeStore from '@src/store';
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
  global.innerWidth = breakpoints.extraExtraLarge.minWidth;

  const courseHomeMetadata = Factory.build('courseHomeMetadata', { ...snakeCaseObject(params) });
  const { courseId, sequenceId, unitId } = mockCourseRequests({
    provider: 'openedx', enabledInContext: params.enabledInContext, courseHomeMetadata,
  });
  Object.assign(mockData, { courseId, sequenceId, unitId });
  const wrapper = await render(
    <>
      <MountCourseQueryHooks courseId={courseId} sequenceId={sequenceId} />
      <LoadedCourse {...mockData} />
    </>,
    { store: initializeStore(), wrapWithRouter: true },
  );
  return {
    ...wrapper, courseId, sequenceId, unitId,
  };
};

export default setupDiscussionSidebar;
