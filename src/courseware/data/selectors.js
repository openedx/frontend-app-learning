/* eslint-disable import/prefer-default-export */
import { COURSE_LOADED } from '../../active-course';

export function sequenceIdsSelector(state) {
  if (state.activeCourse.courseStatus !== COURSE_LOADED) {
    return [];
  }
  const { sectionIds = [] } = state.models.courses[state.activeCourse.courseId];

  const sequenceIds = sectionIds
    .flatMap(sectionId => state.models.sections[sectionId].sequenceIds);

  return sequenceIds;
}
