import {
  getCourseOutline,
  getPathway,
  getPathwayAchievements,
  getPathwayItems,
  getPathwayProgress,
  getPathwaysByCourse,
  markPathwayAchievementsSeen,
} from './api';

describe('course-pathways api', () => {
  describe('getPathwaysByCourse', () => {
    // Until the backend exists, no course has pathways
    it('returns an empty map', async () => {
      await expect(getPathwaysByCourse(['course-v1:edX+DemoX+Demo_Course'])).resolves.toEqual({});
    });
  });

  describe('getPathway', () => {
    // Until the backend exists, every request fails
    it('fails', async () => {
      await expect(getPathway('pathway-1')).rejects.toThrow();
    });
  });

  describe('getPathwayProgress', () => {
    // Until the backend exists, every request fails
    it('fails', async () => {
      await expect(getPathwayProgress('pathway-1')).rejects.toThrow();
    });
  });

  describe('getPathwayAchievements', () => {
    // Until the backend exists, every request fails
    it('fails', async () => {
      await expect(getPathwayAchievements('pathway-1')).rejects.toThrow();
    });
  });

  describe('markPathwayAchievementsSeen', () => {
    // Until the backend exists, it does nothing
    it('resolves without doing anything', async () => {
      await expect(markPathwayAchievementsSeen('pathway-1')).resolves.toBeUndefined();
    });
  });

  describe('getPathwayItems', () => {
    // Until the backend exists, every request fails
    it('fails', async () => {
      await expect(getPathwayItems('pathway-1')).rejects.toThrow();
    });
  });

  describe('getCourseOutline', () => {
    // Until the backend exists, every request fails
    it('fails', async () => {
      await expect(getCourseOutline('course-v1:edX+DE102+2026')).rejects.toThrow();
    });
  });
});
