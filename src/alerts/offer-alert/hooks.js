/* eslint-disable import/prefer-default-export */
import { useModel } from '../../model-store';
import { useAlert } from '../../user-messages';

export function useOfferAlert(courseId) {
  const course = useModel('courses', courseId);
  const rawHtml = (course && course.offerHtml) || null;
  const isVisible = !!rawHtml; // if it exists, show it.

  useAlert(isVisible, {
    code: 'clientOfferAlert',
    topic: 'course',
    payload: { rawHtml },
  });
}
