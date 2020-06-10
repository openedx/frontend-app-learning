/* eslint-disable import/prefer-default-export */
import { useMemo } from 'react';
import { useModel } from '../../model-store';
import { useAlert } from '../../user-messages';

export function useAccessExpirationAlert(courseId) {
  const course = useModel('courses', courseId);
  const rawHtml = (course && course.courseExpiredMessage) || null;
  const isVisible = !!rawHtml; // If it exists, show it.

  const payload = useMemo(() => ({ rawHtml }), [rawHtml]);

  useAlert(isVisible, {
    code: 'clientAccessExpirationAlert',
    topic: 'course',
    payload,
  });
}
