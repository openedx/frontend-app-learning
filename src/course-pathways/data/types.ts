// The shape the UI needs. The API layer is in charge of mapping the backend response to it.
export interface PathwayData {
  pathway: {
    id: string;
    content: {
      displayName: string;
    };
    courseCount: number;
    category?: string;
    categoryLabel?: string;
    categoryBackgroundColor?: string;
    categoryTextColor?: string;
  };
  progress?: {
    completedCourseCount: number;
  };
  provider?: {
    name: string;
  };
}

export type PathwaysByCourse = Record<string, PathwayData[]>;
