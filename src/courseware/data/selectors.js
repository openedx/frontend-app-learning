/* eslint-disable import/prefer-default-export */
export function sequenceIdsSelector(state) {
  try {
    const { sectionIds } = state.models.courses[state.courseware.courseId];
    const sequenceIds = sectionIds.flatMap(sectionId => state.models.sections[sectionId].sequenceIds);
    return sequenceIds;
  } catch (e) {
    return [];
  }
}

export function firstSequenceIdSelector(state) {
  if (state.courseware.courseStatus !== 'loaded') {
    return null;
  }
  try {
    const sectionId = state.models.courses[state.courseware.courseId].sectionIds[0];
    return state.models.sections[sectionId].sequenceIds[0];
  } catch (e) {
    return null;
  }
}
