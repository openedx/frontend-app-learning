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
    categoryBackgroundColor: string;
    categoryTextColor: string;
    detailsUrl: string;
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

export interface PathwayAchievementData {
  credentialId: string;
  displayName: string;
  providerName: string;
  completedOn: string;
  certificateUrl: string;
  isOverarching: boolean;
}

export interface PathwayItemData {
  id: string;
  displayName: string;
  endDate: string;
  hasCertificate: boolean;
  type: 'course';
  status: 'not-started' | 'in-progress' | 'not-passed' | 'passed';
}

export interface CourseSubsectionData {
  id: string;
  displayName: string;
  complete: boolean;
}

export interface CourseSectionData {
  id: string;
  displayName: string;
  complete: boolean;
  subsections: CourseSubsectionData[];
}

export interface PathwayOutlineData {
  items: PathwayItemData[];
}

export type PathwaysByCourse = Record<string, PathwayData[]>;
export type PathwayItemType = PathwayItemData['type'];
export type PathwayItemStatus = PathwayItemData['status'];
export type StartedStatuses = Exclude<PathwayItemStatus, 'not-started'>;
