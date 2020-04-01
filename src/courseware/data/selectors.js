/* eslint-disable import/prefer-default-export */
export function sequenceIdsSelector(state) {
  if (state.courseware.courseStatus !== 'loaded') {
    return [];
  }
  const { sectionIds = [] } = state.models.courses[state.courseware.courseId];

  const sequenceIds = sectionIds
    .flatMap(sectionId => state.models.sections[sectionId].sequenceIds);

  return sequenceIds;
}

export function firstSequenceIdSelector(state) {
  if (state.courseware.courseStatus !== 'loaded') {
    return null;
  }
  const { sectionIds = [] } = state.models.courses[state.courseware.courseId];

  if (sectionIds.length === 0) {
    return null;
  }

  return state.models.sections[sectionIds[0]].sequenceIds[0];
}
