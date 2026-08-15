import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { fetchExamAttemptsData } from '../data/thunks';
import { useProgressTabData } from '../data/apiHooks';

export function useGetExamsData(courseId, sequenceIds) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchExamAttemptsData(courseId, sequenceIds));
  }, [dispatch, courseId, sequenceIds]);
}

export function useProgressData() {
  const { courseId, targetUserId } = useParams();
  return useProgressTabData(courseId, targetUserId).data;
}
