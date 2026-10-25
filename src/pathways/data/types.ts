// The shape the UI needs. The API layer is in charge of mapping the backend response to it.
export interface PathwayData {
  pathway: {
    id: string;
    content: {
      displayName: string;
    };
    itemCount: number;
    category?: string;
    categoryLabel?: string;
    categoryBackgroundColor?: string;
    categoryTextColor?: string;
  };
  progress?: {
    completedItemCount: number;
  };
  provider?: {
    name: string;
  };
}

export interface GradeData {
  displayName: string;
  progress: number;
  passGrade: number;
  currentGrade: number;
  detailsUrl: string;
}

export interface PathwayProgressData {
  id: string;
  itemCount: number;
  completedItemCount: number;
  grades: GradeData[];
}

export type PathwaysByCourse = Record<string, PathwayData[]>;
