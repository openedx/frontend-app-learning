import { useSelector } from 'react-redux';

// eslint-disable-next-line import/prefer-default-export
export const useContextId = () => useSelector(state => state.courseHome.courseId);
