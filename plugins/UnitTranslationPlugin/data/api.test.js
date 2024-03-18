import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { stringify } from 'query-string';

import {
  fetchTranslationConfig,
  getTranslationFeedback,
  createTranslationFeedback,
} from './api';

const mockGetMethod = jest.fn();
const mockPostMethod = jest.fn();
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: () => ({
    get: mockGetMethod,
    post: mockPostMethod,
  }),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('UnitTranslation api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('fetchTranslationConfig', () => {
    const courseId = 'course-v1:edX+DemoX+Demo_Course';
    const expectedResponse = {
      feature_enabled: true,
      available_translation_languages: [
        {
          code: 'en',
          label: 'English',
        },
        {
          code: 'es',
          label: 'Spanish',
        },
      ],
    };
    it('should fetch translation config', async () => {
      const expectedUrl = `http://localhost:18000/api/translatable_xblocks/config/?course_id=${encodeURIComponent(
        courseId,
      )}`;
      mockGetMethod.mockResolvedValueOnce({ data: expectedResponse });
      const result = await fetchTranslationConfig(courseId);
      expect(result).toEqual({
        enabled: true,
        availableLanguages: expectedResponse.available_translation_languages,
      });
      expect(mockGetMethod).toHaveBeenCalledWith(expectedUrl);
    });

    it('should return disabled and unavailable languages on error', async () => {
      mockGetMethod.mockRejectedValueOnce(new Error('error'));
      const result = await fetchTranslationConfig(courseId);
      expect(result).toEqual({
        enabled: false,
        availableLanguages: [],
      });
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('getTranslationFeedback', () => {
    const props = {
      courseId: 'course-v1:edX+DemoX+Demo_Course',
      translationLanguage: 'es',
      unitId: 'unit-v1:edX+DemoX+Demo_Course+type@video+block@video',
      userId: 'test_user',
    };
    const expectedResponse = {
      feedback: 'good',
    };
    it('should fetch translation feedback', async () => {
      const params = stringify({
        translation_language: props.translationLanguage,
        course_id: encodeURIComponent(props.courseId),
        unit_id: encodeURIComponent(props.unitId),
        user_id: props.userId,
      });
      const expectedUrl = `http://localhost:18760/api/v1/whole-course-translation-feedback?${params}`;
      mockGetMethod.mockResolvedValueOnce({ data: expectedResponse });
      const result = await getTranslationFeedback(props);
      expect(result).toEqual(camelCaseObject(expectedResponse));
      expect(mockGetMethod).toHaveBeenCalledWith(expectedUrl);
    });

    it('should return empty object on error', async () => {
      mockGetMethod.mockRejectedValueOnce(new Error('error'));
      const result = await getTranslationFeedback(props);
      expect(result).toEqual({});
      expect(logError).toHaveBeenCalled();
    });
  });

  describe('createTranslationFeedback', () => {
    const props = {
      courseId: 'course-v1:edX+DemoX+Demo_Course',
      feedbackValue: 'good',
      translationLanguage: 'es',
      unitId: 'unit-v1:edX+DemoX+Demo_Course+type@video+block@video',
      userId: 'test_user',
    };
    it('should create translation feedback', async () => {
      const expectedUrl = 'http://localhost:18760/api/v1/whole-course-translation-feedback/';
      mockPostMethod.mockResolvedValueOnce({});
      await createTranslationFeedback(props);
      expect(mockPostMethod).toHaveBeenCalledWith(expectedUrl, {
        course_id: props.courseId,
        feedback_value: props.feedbackValue,
        translation_language: props.translationLanguage,
        unit_id: props.unitId,
        user_id: props.userId,
      });
    });

    it('should log error on failure', async () => {
      mockPostMethod.mockRejectedValueOnce(new Error('error'));
      await createTranslationFeedback(props);
      expect(logError).toHaveBeenCalled();
    });
  });
});
