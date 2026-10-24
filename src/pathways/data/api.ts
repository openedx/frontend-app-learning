import type { PathwayData, PathwaysByCourse } from './types';

// TODO The backend is missing.
// This endpoint should receive a list of course IDs and return a map
// containing the pathways in which the learner is enrolled for each course.
// The response must be mapped here to the `PathwayData` shape.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getPathwaysByCourse = async (_courseIds: string[]): Promise<PathwaysByCourse> => ({});

// TODO The backend is missing.
// This endpoint should receive a pathway ID and return that pathway, with the learner's
// progress in it. A missing pathway or a learner without access must make the request fail.
// The response must be mapped here to the `PathwayData` shape.
// Until then, every request fails.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getPathway = async (_pathwayId: string): Promise<PathwayData> => {
  throw new Error('The pathway backend is missing');
};
