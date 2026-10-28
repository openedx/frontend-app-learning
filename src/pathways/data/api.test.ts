import { getPathway, getPathwaysByCourse } from './api';

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
});
