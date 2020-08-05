/* eslint-disable import/prefer-default-export */
export function sequenceIdsSelector(state) {
  if (state.activeCourse.courseStatus !== 'loaded') {
    return [];
  }
  const { sectionIds = [] } = state.models.courses[state.activeCourse.courseId];

  const sequenceIds = sectionIds
    .flatMap(sectionId => state.models.sections[sectionId].sequenceIds);

  return sequenceIds;
}
