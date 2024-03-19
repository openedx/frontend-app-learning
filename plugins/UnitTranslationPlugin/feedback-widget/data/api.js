import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig, camelCaseObject } from '@edx/frontend-platform';

export async function getTranslationFeedback({
  courseId,
  translationLanguage,
  unitId,
  userId,
}) {
  const aiTranslationsUrl = getConfig().AI_TRANSLATIONS_URL;
  const courseIdEncoded = encodeURIComponent(courseId);
  const unitIdEncoded = encodeURIComponent(unitId);
  const paramsString = `translation_language=${translationLanguage}&course_id=${courseIdEncoded}&unit_id=${unitIdEncoded}&user_id=${userId}`;
  const fetchFeedbackUrl = new URL(`${aiTranslationsUrl}/api/v1/whole-course-translation-feedback?${paramsString}`);
  const { data } = await getAuthenticatedHttpClient().get(fetchFeedbackUrl.href);
  return camelCaseObject(data);
}

export async function createTranslationFeedback({
  courseId,
  feedbackValue,
  translationLanguage,
  unitId,
  userId,
}) {
  const aiTranslationsUrl = getConfig().AI_TRANSLATIONS_URL;
  const createFeedbackUrl = new URL(`${aiTranslationsUrl}/api/v1/whole-course-translation-feedback/`);
  const { data } = await getAuthenticatedHttpClient().post(createFeedbackUrl.href, {
    course_id: courseId,
    feedback_value: feedbackValue,
    translation_language: translationLanguage,
    unit_id: unitId,
    user_id: userId,
  });
  return camelCaseObject(data);
}
