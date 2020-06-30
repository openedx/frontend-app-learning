/* eslint-disable import/prefer-default-export */
import { useAlert } from '../../user-messages';
import { useModel } from '../../generic/model-store';

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
