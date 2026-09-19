import type { RootState } from '@src/store';

// The model store is untyped JS (it dissolves in #1977); name the maps courseware reads.
export interface CoursewareModels {
  coursewareMeta?: Record<string, any>;
  sequences?: Record<string, any>;
  sections?: Record<string, any>;
}

export const readModels = (state: RootState) => state.models as CoursewareModels;
