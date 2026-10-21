import { useParams } from 'react-router-dom';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { getCourseOutlineUrl, getDatesTabUrl, getProgressTabUrl } from './utils';

const useTabs = () => {
  const { courseId } = useParams();
  return useCourseHomeMeta(courseId, { enabled: false }).data?.tabs;
};

export const useCourseOutlineUrl = () => getCourseOutlineUrl(useTabs());
export const useDatesTabUrl = () => getDatesTabUrl(useTabs());
export const useProgressTabUrl = () => getProgressTabUrl(useTabs());
