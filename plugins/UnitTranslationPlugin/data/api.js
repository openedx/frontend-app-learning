import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { stringify } from 'query-string';

export const fetchTranslationConfig = async (courseId) => {
  const url = `${
    getConfig().LMS_BASE_URL
  }/api/translatable_xblocks/config/?course_id=${encodeURIComponent(courseId)}`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return {
      enabled: data.feature_enabled,
      availableLanguages: data.available_translation_languages || [
        {
          code: 'en',
          label: 'English',
        },
        {
          code: 'es',
          label: 'Spanish',
        },
        {
          code: 'ar',
          label: 'Arabic',
        },
      ],
    };
  } catch (error) {
    logError(`Translation plugin fail to fetch from ${url}`, error);
    return {
      enabled: false,
      availableLanguages: [],
    };
  }
};

export async function getTranslationFeedback({
  courseId,
  translationLanguage,
  unitId,
  userId,
}) {
  const params = stringify({
    translation_language: translationLanguage,
    course_id: encodeURIComponent(courseId),
    unit_id: encodeURIComponent(unitId),
    user_id: userId,
  });
  const fetchFeedbackUrl = `${
    getConfig().AI_TRANSLATIONS_URL
  }/api/v1/whole-course-translation-feedback?${params}`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(fetchFeedbackUrl);
    return camelCaseObject(data);
  } catch (error) {
    logError(
      `Translation plugin fail to fetch from ${fetchFeedbackUrl}`,
      error,
    );
    return {};
  }
}

export async function createTranslationFeedback({
  courseId,
  feedbackValue,
  translationLanguage,
  unitId,
  userId,
}) {
  const createFeedbackUrl = `${
    getConfig().AI_TRANSLATIONS_URL
  }/api/v1/whole-course-translation-feedback/`;
  try {
    const { data } = await getAuthenticatedHttpClient().post(
      createFeedbackUrl,
      {
        course_id: courseId,
        feedback_value: feedbackValue,
        translation_language: translationLanguage,
        unit_id: unitId,
        user_id: userId,
      },
    );
    return camelCaseObject(data);
  } catch (error) {
    logError(
      `Translation plugin fail to create feedback from ${createFeedbackUrl}`,
      error,
    );
    return {};
  }
}
