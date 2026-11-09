import type { PathwaysByCourse } from './types';

// TODO The backend is missing.
// This endpoint should receive a list of course IDs and return a map
// containing the pathways in which the learner is enrolled for each course.
// The response must be mapped here to the `PathwayData` shape.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getPathwaysByCourse = async (_courseIds: string[]): Promise<PathwaysByCourse> => ({});
