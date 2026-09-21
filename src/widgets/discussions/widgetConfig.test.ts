import { mergeConfig } from '@edx/frontend-platform';
import { prefetchDiscussionTopics } from '@src/courseware/data/apiHooks';
import { initializeMockApp } from '@src/setupTest';

import { discussionsPrefetch } from './widgetConfig';

jest.mock('@src/courseware/data/apiHooks', () => ({
  prefetchDiscussionTopics: jest.fn(),
}));

initializeMockApp();

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const queryClient = { id: 'queryClient' };
const datesTab = { tabId: 'dates', title: 'Dates', url: 'http://localhost/dates' };
const discussionTab = { tabId: 'discussion', title: 'Discussion', url: 'http://localhost/discussion' };

describe('discussionsPrefetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mergeConfig({ DISCUSSIONS_MFE_BASE_URL: 'http://localhost:2002' });
  });

  it('prefetches topics when the course has a discussion tab', () => {
    discussionsPrefetch({ courseId, course: { tabs: [datesTab, discussionTab] }, queryClient });

    expect(prefetchDiscussionTopics).toHaveBeenCalledWith(queryClient, courseId);
  });

  it('does not prefetch when the course has no discussion tab', () => {
    discussionsPrefetch({ courseId, course: { tabs: [datesTab] }, queryClient });

    expect(prefetchDiscussionTopics).not.toHaveBeenCalled();
  });

  it('does not prefetch before the course metadata has loaded', () => {
    discussionsPrefetch({ courseId, course: undefined, queryClient });

    expect(prefetchDiscussionTopics).not.toHaveBeenCalled();
  });

  it('does not prefetch without a discussions MFE configured', () => {
    mergeConfig({ DISCUSSIONS_MFE_BASE_URL: '' });

    discussionsPrefetch({ courseId, course: { tabs: [discussionTab] }, queryClient });

    expect(prefetchDiscussionTopics).not.toHaveBeenCalled();
  });
});
