import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { fetchExamAttemptsData } from '../data/thunks';

export function useGetExamsData(courseId, sequenceIds) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchExamAttemptsData(courseId, sequenceIds));
  }, [dispatch, courseId, sequenceIds]);
}
