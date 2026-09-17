import { useParams } from 'react-router-dom';

import { useExamAttemptsData, useProgressTabData } from '../data/apiHooks';

export function useProgressData() {
  const { courseId, targetUserId } = useParams();
  return useProgressTabData(courseId, targetUserId).data;
}

// Plugin-facing; no in-app caller.
export function useExamsData() {
  const { courseId } = useParams();
  const sectionScores = useProgressData()?.sectionScores;
  const sequenceIds = sectionScores
    ?.flatMap((section) => section.subsections)
    .map((subsection) => subsection.blockKey);
  return useExamAttemptsData(courseId, sequenceIds).data ?? null;
}
