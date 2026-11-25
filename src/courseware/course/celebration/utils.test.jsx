import { QueryClient } from '@tanstack/react-query';

import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
import { postCelebrationComplete } from './data/api';
import { recordFirstSectionCelebration, shouldCelebrateOnSectionLoad } from './utils';

jest.mock('./data/api');

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const { queryKey } = courseHomeMetaQuery(courseId);
const celebrations = { firstSection: true, streakLengthToCelebrate: null, weeklyGoal: false };
const markerKey = 'CelebrationModal.showOnSectionLoad';

const seededQueryClient = () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKey, { id: courseId, org: 'edX', celebrations });
  return queryClient;
};

beforeEach(() => {
  global.localStorage.clear();
  postCelebrationComplete.mockClear();
});

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
    setLocalStorage(markerKey, { prevSequenceId: 'sequence-1', nextSequenceId: 'sequence-2' });
    const queryClient = seededQueryClient();

    expect(shouldCelebrateOnSectionLoad(courseId, 'sequence-3', true, queryClient, celebrations)).toBe(false);

    expect(queryClient.getQueryData(queryKey).celebrations).toEqual({ ...celebrations, firstSection: false });
    expect(getLocalStorage(markerKey)).toBeNull();
  });

  it('does not celebrate with no marker', () => {
    expect(shouldCelebrateOnSectionLoad(courseId, 'sequence-2', true, seededQueryClient(), celebrations)).toBe(false);
  });

  it('does not celebrate when the course does not flag the first section, and keeps the marker', () => {
    setLocalStorage(markerKey, { prevSequenceId: 'sequence-1', nextSequenceId: 'sequence-2' });

    expect(shouldCelebrateOnSectionLoad(courseId, 'sequence-2', undefined, seededQueryClient(), celebrations)).toBe(false);
    expect(getLocalStorage(markerKey)).not.toBeNull();
  });
});
