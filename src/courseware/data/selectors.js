import { LOADED } from './slice';

export function sequenceIdsSelector(state) {
  if (state.courseware.courseStatus !== LOADED) {
    return [];
  }
  const { sectionIds = [] } = state.models.coursewareMeta[state.courseware.courseId];

  return sectionIds
    .flatMap(sectionId => state.models.sections[sectionId].sequenceIds);
}

export const getDiscussionsSidebarSettings = state => state.courseware.discussionsSidebarSettings;
