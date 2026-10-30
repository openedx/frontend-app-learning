import {
  getAppConfig, getAuthenticatedHttpClient, getSiteConfig, mergeAppConfig, mergeSiteConfig,
} from '@openedx/frontend-base';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';
import {
  getCourseHomeCourseMetadata, getCoursewareSearchEnabled, getDatesTabData, getExamsData, getOutlineTabData,
  getProctoringInfoData, getProgressTabData, getTimeOffsetMillis, searchCourseContentFromAPI, unsubscribeFromCourseGoal,
} from './api';
import { appId } from '@src/constants';
import { appendBrowserTimezoneToUrl } from '../../utils';

const axiosMock = new MockAdapter(getAuthenticatedHttpClient());

// The exam endpoints live on the LMS unless EXAMS_BASE_URL names an exams service.
const setUrls = ({ examsBaseUrl, lmsBaseUrl }) => {
  mergeSiteConfig({ lmsBaseUrl });
  mergeAppConfig(appId, { EXAMS_BASE_URL: examsBaseUrl });
};
const currentUrls = () => ({
  examsBaseUrl: getAppConfig(appId).EXAMS_BASE_URL ?? null,
  lmsBaseUrl: getSiteConfig().lmsBaseUrl,
});

describe('Calculate the time offset properly', () => {
  it('Should return 0 if the headerDate is not set', async () => {
    const offset = getTimeOffsetMillis(undefined, undefined, undefined);
    expect(offset).toBe(0);
  });

  it('Should return the offset', async () => {
    const headerDate = '2021-04-13T11:01:58.135Z';
    const requestTime = new Date('2021-04-12T11:01:57.135Z');
    const responseTime = new Date('2021-04-12T11:01:58.635Z');
    const offset = getTimeOffsetMillis(headerDate, requestTime, responseTime);
    expect(offset).toBe(86398750);
  });
});

describe('getExamsData', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@12345';
  let originalUrls;

  beforeEach(() => {
    axiosMock.reset();
    originalUrls = currentUrls();
  });

  afterEach(() => {
    axiosMock.reset();
    setUrls(originalUrls);
  });

  it('should use LMS URL when EXAMS_BASE_URL is not configured', async () => {
    setUrls({ examsBaseUrl: null, lmsBaseUrl: 'http://localhost:18000' });

    const mockExamData = {
      exam: {
        id: 1,
        course_id: courseId,
        content_id: sequenceId,
        exam_name: 'Test Exam',
        attempt_status: 'created',
      },
    };

    const expectedUrl = `http://localhost:18000/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}?is_learning_mfe=true&content_id=${encodeURIComponent(sequenceId)}`;
    axiosMock.onGet(expectedUrl).reply(200, mockExamData);

    const result = await getExamsData(courseId, sequenceId);

    expect(result).toEqual({
      exam: {
        id: 1,
        courseId,
        contentId: sequenceId,
        examName: 'Test Exam',
        attemptStatus: 'created',
      },
    });
    expect(axiosMock.history.get).toHaveLength(1);
    expect(axiosMock.history.get[0].url).toBe(expectedUrl);
  });

  it('should use EXAMS_BASE_URL when configured', async () => {
    setUrls({ examsBaseUrl: 'http://localhost:18740', lmsBaseUrl: 'http://localhost:18000' });

    const mockExamData = {
      exam: {
        id: 1,
        course_id: courseId,
        content_id: sequenceId,
        exam_name: 'Test Exam',
        attempt_status: 'submitted',
      },
    };

    const expectedUrl = `http://localhost:18740/api/v1/student/exam/attempt/course_id/${encodeURIComponent(courseId)}/content_id/${encodeURIComponent(sequenceId)}`;
    axiosMock.onGet(expectedUrl).reply(200, mockExamData);

    const result = await getExamsData(courseId, sequenceId);

    expect(result).toEqual({
      exam: {
        id: 1,
        courseId,
        contentId: sequenceId,
        examName: 'Test Exam',
        attemptStatus: 'submitted',
      },
    });
    expect(axiosMock.history.get).toHaveLength(1);
    expect(axiosMock.history.get[0].url).toBe(expectedUrl);
  });

  it('should return empty object when API returns 404', async () => {
    setUrls({ examsBaseUrl: null, lmsBaseUrl: 'http://localhost:18000' });

    const expectedUrl = `http://localhost:18000/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}?is_learning_mfe=true&content_id=${encodeURIComponent(sequenceId)}`;

    // Mock a 404 error with the custom error response function to add customAttributes
    axiosMock.onGet(expectedUrl).reply(() => {
      const error = new Error('Request failed with status code 404');
      error.response = { status: 404, data: {} };
      error.customAttributes = { httpErrorStatus: 404 };
      return Promise.reject(error);
    });

    const result = await getExamsData(courseId, sequenceId);

    expect(result).toEqual({});
    expect(axiosMock.history.get).toHaveLength(1);
  });

  it('should throw error for non-404 HTTP errors', async () => {
    setUrls({ examsBaseUrl: null, lmsBaseUrl: 'http://localhost:18000' });

    const expectedUrl = `http://localhost:18000/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}?is_learning_mfe=true&content_id=${encodeURIComponent(sequenceId)}`;

    // Mock a 500 error with custom error response
    axiosMock.onGet(expectedUrl).reply(() => {
      const error = new Error('Request failed with status code 500');
      error.response = { status: 500, data: { error: 'Server Error' } };
      error.customAttributes = { httpErrorStatus: 500 };
      return Promise.reject(error);
    });

    await expect(getExamsData(courseId, sequenceId)).rejects.toThrow();
    expect(axiosMock.history.get).toHaveLength(1);
  });

  it('should properly encode URL parameters', async () => {
    setUrls({ examsBaseUrl: 'http://localhost:18740', lmsBaseUrl: 'http://localhost:18000' });

    const specialCourseId = 'course-v1:edX+Demo X+Demo Course';
    const specialSequenceId = 'block-v1:edX+Demo X+Demo Course+type@sequential+block@test sequence';

    const mockExamData = { exam: { id: 1 } };
    const expectedUrl = `http://localhost:18740/api/v1/student/exam/attempt/course_id/${encodeURIComponent(specialCourseId)}/content_id/${encodeURIComponent(specialSequenceId)}`;
    axiosMock.onGet(expectedUrl).reply(200, mockExamData);

    await getExamsData(specialCourseId, specialSequenceId);

    expect(axiosMock.history.get[0].url).toBe(expectedUrl);
    expect(axiosMock.history.get[0].url).toContain('course-v1%3AedX%2BDemo%20X%2BDemo%20Course');
    expect(axiosMock.history.get[0].url).toContain('block-v1%3AedX%2BDemo%20X%2BDemo%20Course%2Btype%40sequential%2Bblock%40test%20sequence');
  });
});

describe('getCourseHomeCourseMetadata', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const metadataUrl = appendBrowserTimezoneToUrl(`${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`);

  beforeEach(() => {
    axiosMock.reset();
  });

  it('returns the course access camelCased', async () => {
    axiosMock.onGet(metadataUrl).reply(200, {
      course_access: {
        has_access: false,
        error_code: 'audit_expired',
        additional_context_user_message: 'uhoh oh no',
        developer_message: null,
      },
    });
    const { courseAccess } = await getCourseHomeCourseMetadata(courseId);
    expect(courseAccess).toEqual({
      hasAccess: false,
      errorCode: 'audit_expired',
      additionalContextUserMessage: 'uhoh oh no',
      developerMessage: null,
    });
  });
});

describe('getDatesTabData', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const datesUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/dates/${courseId}`;

  beforeEach(() => {
    axiosMock.reset();
  });

  it('returns camelCased data on success', async () => {
    axiosMock.onGet(datesUrl).reply(200, { course_date_blocks: [] });
    await expect(getDatesTabData(courseId)).resolves.toEqual({ courseDateBlocks: [] });
  });

  it('swallows a 401 and resolves to an empty object', async () => {
    axiosMock.onGet(datesUrl).reply(401);
    await expect(getDatesTabData(courseId)).resolves.toEqual({});
  });

  it('swallows a 403 and resolves to an empty object', async () => {
    axiosMock.onGet(datesUrl).reply(403);
    await expect(getDatesTabData(courseId)).resolves.toEqual({});
  });

  it('re-throws other errors', async () => {
    axiosMock.onGet(datesUrl).reply(500);
    await expect(getDatesTabData(courseId)).rejects.toThrow();
  });
});

describe('getProgressTabData', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const progressUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/progress/${courseId}`;
  // The factory's attrs share their nested objects across builds, and these tests mutate them.
  const lockedProgress = () => JSON.parse(JSON.stringify(Factory.build('progressTabData', {
    completion_summary: { complete_count: 1, incomplete_count: 0, locked_count: 1 },
  })));

  beforeEach(() => {
    axiosMock.reset();
  });

  it('marks the grades partially locked when the learner can reach some gated content', async () => {
    axiosMock.onGet(progressUrl).reply(200, lockedProgress());
    const progress = await getProgressTabData(courseId);
    expect(progress.gradesFeatureIsFullyLocked).toBe(false);
    expect(progress.gradesFeatureIsPartiallyLocked).toBe(true);
  });

  it('marks the grades fully locked when the learner can reach no gated content', async () => {
    const data = lockedProgress();
    data.section_scores[0].subsections[0].learner_has_access = false;
    axiosMock.onGet(progressUrl).reply(200, data);
    const progress = await getProgressTabData(courseId);
    expect(progress.gradesFeatureIsFullyLocked).toBe(true);
    expect(progress.gradesFeatureIsPartiallyLocked).toBe(false);
  });

  it('leaves the grades fully locked when the content the learner can reach has no assignment type', async () => {
    const data = lockedProgress();
    data.section_scores[0].subsections[0].assignment_type = null;
    axiosMock.onGet(progressUrl).reply(200, data);
    const progress = await getProgressTabData(courseId);
    expect(progress.gradesFeatureIsFullyLocked).toBe(true);
    expect(progress.gradesFeatureIsPartiallyLocked).toBe(false);
  });

  it('marks the grades partially locked when the content the learner can reach has points earned but none possible', async () => {
    const data = lockedProgress();
    Object.assign(data.section_scores[0].subsections[0], { num_points_earned: 2, num_points_possible: 0 });
    axiosMock.onGet(progressUrl).reply(200, data);
    const progress = await getProgressTabData(courseId);
    expect(progress.gradesFeatureIsFullyLocked).toBe(false);
    expect(progress.gradesFeatureIsPartiallyLocked).toBe(true);
  });
});

describe('getOutlineTabData', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const outlineUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/outline/${courseId}`;

  beforeEach(() => {
    axiosMock.reset();
  });

  it('returns the normalized outline, with no time offset when the response has no date header', async () => {
    axiosMock.onGet(outlineUrl).reply(200, { course_blocks: null, enrollment_mode: 'audit', welcome_message_html: null });
    const outline = await getOutlineTabData(courseId);
    expect(outline).toMatchObject({
      courseBlocks: {}, enrollmentMode: 'audit', timeOffsetMillis: 0, welcomeMessageHtml: '',
    });
  });
});

describe('unsubscribeFromCourseGoal', () => {
  const token = 'goal-token';
  const unsubscribeUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/unsubscribe_from_course_goal/${token}`;

  beforeEach(() => {
    axiosMock.reset();
  });

  it('POSTs the token and returns the response camelCased', async () => {
    axiosMock.onPost(unsubscribeUrl).reply(200, { course_title: 'Demonstration Course' });
    const response = await unsubscribeFromCourseGoal(token);
    expect(response.data).toEqual({ courseTitle: 'Demonstration Course' });
  });
});

describe('getCoursewareSearchEnabled', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const enabledUrl = `${getSiteConfig().lmsBaseUrl}/courses/${courseId}/courseware-search/enabled/`;

  beforeEach(() => {
    axiosMock.reset();
  });

  it('returns whether search is enabled', async () => {
    axiosMock.onGet(enabledUrl).reply(200, { enabled: true });
    await expect(getCoursewareSearchEnabled(courseId)).resolves.toEqual({ enabled: true });
  });

  it('treats a missing flag as disabled', async () => {
    axiosMock.onGet(enabledUrl).reply(200, {});
    await expect(getCoursewareSearchEnabled(courseId)).resolves.toEqual({ enabled: false });
  });
});

describe('getProctoringInfoData', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  let originalUrls;

  beforeEach(() => {
    axiosMock.reset();
    originalUrls = currentUrls();
  });

  afterEach(() => {
    axiosMock.reset();
    setUrls(originalUrls);
  });

  it('uses the LMS proctoring URL, with the username, when EXAMS_BASE_URL is not configured', async () => {
    setUrls({ examsBaseUrl: null, lmsBaseUrl: 'http://localhost:18000' });
    const expectedUrl = `http://localhost:18000/api/edx_proctoring/v1/user_onboarding/status?is_learning_mfe=true&course_id=${encodeURIComponent(courseId)}&username=learner`;
    axiosMock.onGet(expectedUrl).reply(200, { onboarding_status: 'verified' });

    await expect(getProctoringInfoData(courseId, 'learner')).resolves.toEqual({ onboarding_status: 'verified' });
    expect(axiosMock.history.get[0].url).toBe(expectedUrl);
  });

  it.each([
    ['the LMS', null, `http://localhost:18000/api/edx_proctoring/v1/user_onboarding/status?is_learning_mfe=true&course_id=${encodeURIComponent(courseId)}`],
    ['the exams service', 'http://localhost:18740', `http://localhost:18740/api/v1/student/course_id/${encodeURIComponent(courseId)}/onboarding`],
  ])('asks %s without a username when none is given', async (_service, examsBaseUrl, expectedUrl) => {
    setUrls({ examsBaseUrl, lmsBaseUrl: 'http://localhost:18000' });
    axiosMock.onGet(expectedUrl).reply(200, { onboarding_status: 'verified' });

    await expect(getProctoringInfoData(courseId)).resolves.toEqual({ onboarding_status: 'verified' });
    expect(axiosMock.history.get[0].url).toBe(expectedUrl);
  });
});

describe('searchCourseContentFromAPI', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const searchUrl = `${getSiteConfig().lmsBaseUrl}/search/${courseId}`;

  beforeEach(() => {
    axiosMock.reset();
  });

  it('POSTs the search form with the default page size and camel-cases the response', async () => {
    axiosMock.onPost(searchUrl).reply(200, { total_hits: 1, results: [] });

    const response = await searchCourseContentFromAPI(courseId, 'quiz');

    expect(axiosMock.history.post[0].data).toBe('search_string=quiz&page_size=20&page_index=0');
    expect(response.data).toEqual({ totalHits: 1, results: [] });
  });
});
