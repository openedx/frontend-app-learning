import { useSelector } from 'react-redux';
import { RootState } from '../store';

// eslint-disable-next-line import/prefer-default-export
export const useContextId = () => useSelector<RootState>(
  state => state.courseware.courseId ?? state.courseHome.courseId,
);
