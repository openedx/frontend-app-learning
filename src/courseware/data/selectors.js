/* eslint-disable import/prefer-default-export */
export function sequenceIdsSelector(state) {
  if (state.courseware.courseStatus !== 'loaded') {
    return [];
  }
  const { sectionIds = [] } = state.models.coursewareMeta[state.courseware.courseId];

  const sequenceIds = sectionIds
    .flatMap(sectionId => state.models.sections[sectionId].sequenceIds);

  return sequenceIds;
}
