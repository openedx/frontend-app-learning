import { QueryClient } from '@tanstack/react-query';

import { courseHomeQueryKeys } from '../../../course-home/data/queryKeys';
import { setLocalStorage } from '../../../data/localStorage';
import { recordFirstSectionCelebration, shouldCelebrateOnSectionLoad } from './utils';

jest.mock('@edx/frontend-platform/analytics');
jest.mock('./data/api');
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(() => ({ administrator: 'admin' })),
}));

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const queryKey = courseHomeQueryKeys.metadata(courseId);
const celebrations = { firstSection: true, streakLengthToCelebrate: null, weeklyGoal: false };

const seededQueryClient = () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKey, { id: courseId, org: 'edX', celebrations });
  return queryClient;
};

describe('recordFirstSectionCelebration', () => {
  it('marks the first section celebrated in the course metadata query', () => {
    const queryClient = seededQueryClient();

    recordFirstSectionCelebration('edX', courseId, celebrations, queryClient);

    expect(queryClient.getQueryData(queryKey)).toEqual({
      id: courseId,
      org: 'edX',
      celebrations: { ...celebrations, firstSection: false },
    });
  });
});

describe('shouldCelebrateOnSectionLoad', () => {
  it('marks the first section celebrated when the learner moves off the celebrated sequence', () => {
    setLocalStorage('CelebrationModal.showOnSectionLoad', { prevSequenceId: 'sequence-1', nextSequenceId: 'sequence-2' });
    const queryClient = seededQueryClient();

    expect(shouldCelebrateOnSectionLoad(courseId, 'sequence-3', true, queryClient, celebrations)).toBe(false);

    expect(queryClient.getQueryData(queryKey).celebrations).toEqual({ ...celebrations, firstSection: false });
  });
});
