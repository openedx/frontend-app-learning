import type { PathwayData, PathwayProgressData, PathwaysByCourse } from '../types';

export const dataEngineering: PathwayData = {
  pathway: {
    id: 'pathway-1',
    content: { displayName: 'Data Engineering Fundamentals' },
    itemCount: 6,
    category: 'bootcamp',
    categoryLabel: 'Bootcamp',
  },
  progress: { completedItemCount: 3 },
  provider: { name: 'MIT OpenCourseWare' },
};

export const machineLearning: PathwayData = {
  pathway: {
    id: 'pathway-2',
    content: { displayName: 'Introduction to Machine Learning' },
    itemCount: 12,
    category: 'tutorial',
    categoryLabel: 'Tutorial',
    categoryBackgroundColor: '#FCE4F3',
    categoryTextColor: '#9B1766',
  },
  progress: { completedItemCount: 0 },
  provider: { name: 'Stanford' },
};

export const loremIpsum: PathwayData = {
  pathway: {
    id: 'pathway-3',
    content: { displayName: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod' },
    itemCount: 4,
    category: 'tutorial',
    categoryLabel: 'Tutorial',
  },
  progress: { completedItemCount: 1 },
  provider: { name: 'Stanford' },
};

export const sedUt: PathwayData = {
  pathway: {
    id: 'pathway-4',
    content: { displayName: 'Sed ut perspiciatis unde omnis iste natus' },
    itemCount: 3,
    category: 'tutorial',
    categoryLabel: 'Tutorial',
  },
  progress: { completedItemCount: 0 },
};

export const nemoEnim: PathwayData = {
  pathway: {
    id: 'pathway-5',
    content: { displayName: 'Nemo enim ipsam voluptatem' },
    itemCount: 5,
    category: 'certificate',
    categoryLabel: 'Certificate',
  },
  progress: { completedItemCount: 2 },
};

export const courseIdWithPathways = 'course-v1:edX+DemoX+Demo_Course';
export const courseIdWithManyPathways = 'course-v1:edX+Many+Pathways';
export const courseIdWithoutPathways = 'course-v1:edX+No+Pathways';

export const pathwaysByCourse: PathwaysByCourse = {
  [courseIdWithPathways]: [dataEngineering, machineLearning],
  [courseIdWithManyPathways]: [dataEngineering, machineLearning, loremIpsum, sedUt, nemoEnim],
};

export const dataEngineeringProgress: PathwayProgressData = {
  id: 'pathway-1',
  itemCount: 6,
  completedItemCount: 3,
  grades: [
    {
      displayName: 'Introduction to Data Engineering',
      progress: 100,
      passGrade: 70,
      currentGrade: 85,
      detailsUrl: '/course/course-v1:edX+DE101+2026/progress',
    },
    {
      displayName: 'Data Pipelines',
      progress: 40,
      passGrade: 70,
      currentGrade: 30,
      detailsUrl: '/course/course-v1:edX+DE102+2026/progress',
    },
    {
      displayName: 'Data Warehousing',
      progress: 65,
      passGrade: 60,
      currentGrade: 55,
      detailsUrl: '/course/course-v1:edX+DE103+2026/progress',
    },
    {
      displayName: 'Stream Processing',
      progress: 0,
      passGrade: 70,
      currentGrade: 0,
      detailsUrl: '/course/course-v1:edX+DE104+2026/progress',
    },
  ],
};
