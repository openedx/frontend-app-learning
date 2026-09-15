import { logError } from '@edx/frontend-platform/logging';
import { updateModels } from '../../generic/model-store';
import {
  getCourseDiscussionConfig,
  getCourseTopics,
} from './api';

export function getCourseDiscussionTopics(courseId) {
  return async (dispatch) => {
    try {
      const config = await getCourseDiscussionConfig(courseId);
      // Only load topics for the openedx provider, the legacy provider uses
      // the xblock
      if (config.provider === 'openedx') {
        const topics = await getCourseTopics(courseId);
        dispatch(updateModels({
          modelType: 'discussionTopics',
          models: topics.filter(topic => topic.usageKey),
          idField: 'usageKey',
        }));
      }
    } catch (error) {
      logError(error);
    }
  };
}
