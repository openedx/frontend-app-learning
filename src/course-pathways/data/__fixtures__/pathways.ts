import type { PathwayData, PathwaysByCourse } from '../types';

export const dataEngineering: PathwayData = {
  pathway: {
    id: 'pathway-1',
    content: { displayName: 'Data Engineering Fundamentals' },
    courseCount: 6,
    category: 'bootcamp',
    categoryLabel: 'Bootcamp',
  },
  progress: { completedCourseCount: 0 },
  provider: { name: 'MIT OpenCourseWare' },
};

export const machineLearning: PathwayData = {
  pathway: {
    id: 'pathway-2',
    content: { displayName: 'Introduction to Machine Learning' },
    courseCount: 12,
    category: 'tutorial',
    categoryLabel: 'Tutorial',
    categoryBackgroundColor: '#FCE4F3',
    categoryTextColor: '#9B1766',
  },
  progress: { completedCourseCount: 0 },
  provider: { name: 'Stanford' },
};

export const loremIpsum: PathwayData = {
  pathway: {
    id: 'pathway-3',
    content: { displayName: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod' },
    courseCount: 4,
    category: 'tutorial',
    categoryLabel: 'Tutorial',
  },
  progress: { completedCourseCount: 1 },
  provider: { name: 'Stanford' },
};

export const sedUt: PathwayData = {
  pathway: {
    id: 'pathway-4',
    content: { displayName: 'Sed ut perspiciatis unde omnis iste natus' },
    courseCount: 3,
    category: 'tutorial',
    categoryLabel: 'Tutorial',
  },
  progress: { completedCourseCount: 0 },
};

export const nemoEnim: PathwayData = {
  pathway: {
    id: 'pathway-5',
    content: { displayName: 'Nemo enim ipsam voluptatem' },
    courseCount: 5,
    category: 'certificate',
    categoryLabel: 'Certificate',
  },
  progress: { completedCourseCount: 2 },
};

export const courseIdWithPathways = 'course-v1:edX+DemoX+Demo_Course';
export const courseIdWithManyPathways = 'course-v1:edX+Many+Pathways';
export const courseIdWithoutPathways = 'course-v1:edX+No+Pathways';

export const pathwaysByCourse: PathwaysByCourse = {
  [courseIdWithPathways]: [dataEngineering, machineLearning],
  [courseIdWithManyPathways]: [dataEngineering, machineLearning, loremIpsum, sedUt, nemoEnim],
};
