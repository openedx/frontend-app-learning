/* eslint-disable import/prefer-default-export */
import { createSelector } from 'reselect';

export const activeCourseSelector = createSelector(
  (state) => state.models.courses || {},
  (state) => state.activeCourse.courseId,
  (coursesById, courseId) => (coursesById[courseId] ? coursesById[courseId] : null),
);
