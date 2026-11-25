import { useCourseId, useTargetUserId } from '@src/generic/course-params';

import { useExamAttemptsData, useProgressTabData } from '../data/apiHooks';

export function useProgressData() {
  const courseId = useCourseId();
  const targetUserId = useTargetUserId();
  return useProgressTabData(courseId, targetUserId, { enabled: false }).data;
}

// Plugin-facing; no in-app caller.
export function useExamsData() {
  const courseId = useCourseId();
  const sectionScores = useProgressData()?.sectionScores;
  const sequenceIds = sectionScores
    ?.flatMap((section) => section.subsections)
    .map((subsection) => subsection.blockKey);
  return useExamAttemptsData(courseId, sequenceIds).data ?? null;
}
