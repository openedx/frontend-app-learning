import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getResponseStatus } from '@src/data/http-error';
import type { TabMetadata } from '@src/course-tabs/utils';
import { appendBrowserTimezoneToUrl } from '../../utils';
import { type CourseHomeAccessExpiration, type CourseHomeOutline, normalizeCourseHomeOutline } from './courseHomeOutline';

// The result types below name only the fields this repo's readers use; each endpoint returns more,
// left reachable as `unknown` so plugins importing the hooks are not limited to our list. The full
// shapes are openedx-platform's to describe — a copy of them here would drift — so they stay partial
// until the platform ships types we can import.

// GET /api/course_home/v1/course_metadata/
export interface CourseHomeMeta {
  canViewCertificate: boolean;
  celebrations: {
    streakLengthToCelebrate?: number | null;
    streakDiscountEnabled?: boolean;
  } | null;
  courseAccess: { hasAccess: boolean };
  courseModes: { slug: string; name: string }[];
  hasCourseAuthorAccess: boolean;
  isEnrolled: boolean;
  // Computed here, not sent by the platform.
  isMasquerading: boolean;
  isSelfPaced: boolean;
  isStaff: boolean;
  number: string;
  org: string;
  originalUserIsStaff: boolean;
  start: string;
  tabs: TabMetadata[];
  title: string;
  username: string;
  userTimezone: string | null;
  verifiedMode: Record<string, unknown> | null;
  courseThemeVariant: string | null;
  [key: string]: unknown;
}

/**
 * Tweak the metadata for consistency
 * @param metadata the data to normalize
 * @returns {Object} The normalized metadata
 */
function normalizeCourseHomeCourseMetadata(metadata: unknown): CourseHomeMeta {
  const data = camelCaseObject(metadata);
  return {
    ...data,
    isMasquerading: data.originalUserIsStaff && !data.isStaff,
  };
}

export async function getCourseHomeCourseMetadata(courseId: string): Promise<CourseHomeMeta> {
  let url = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`;
  url = appendBrowserTimezoneToUrl(url);
  const { data } = await getAuthenticatedHttpClient().get(url);
  return normalizeCourseHomeCourseMetadata(data);
}

// One entry of a tab's `course_date_blocks` (the platform's `DateSummarySerializer`), on the dates tab
// and in the outline's dates widget.
export interface CourseHomeDateBlock {
  assignmentType: string | null;
  complete: boolean | null;
  date: string;
  dateType: string;
  description: string;
  extraInfo: string | null;
  learnerHasAccess: boolean;
  link: string;
  title: string;
  [key: string]: unknown;
}

// GET /api/course_home/v1/dates/. Every field is optional because the 401 and 403 branches return `{}`.
export interface CourseHomeDates {
  courseDateBlocks?: CourseHomeDateBlock[];
  datesBannerInfo?: {
    contentTypeGatingEnabled: boolean;
    missedDeadlines: boolean;
    missedGatedContent: boolean;
    verifiedUpgradeLink: string | null;
    [key: string]: unknown;
  };
  hasEnded?: boolean;
  [key: string]: unknown;
}

// For debugging purposes, you might like to see a fully loaded dates tab.
// Just uncomment the next few lines and the immediate 'return' in the function below
// import { Factory } from 'rosie';
// import './__factories__';
export async function getDatesTabData(courseId: string): Promise<CourseHomeDates> {
  // return camelCaseObject(Factory.build('datesTabData'));
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/dates/${courseId}`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(data);
  } catch (error) {
    const httpErrorStatus = getResponseStatus(error);
    if (httpErrorStatus === 401) {
      // The backend sends this for unenrolled and unauthenticated learners, but we handle those cases by examining
      // courseAccess in the metadata call, so just ignore this status for now.
      return {};
    }
    if (httpErrorStatus === 403) {
      // The backend sends this if there is a course access error and the user should be redirected. The redirect
      // info is included in the course metadata request and will be handled there as long as this call returns
      // without an error
      return {};
    }
    throw error;
  }
}

export interface CourseHomeProgressSubsectionScore {
  assignmentType: string | null;
  blockKey: string;
  displayName: string;
  hasGradedAssignment: boolean;
  learnerHasAccess: boolean;
  numPointsEarned: number;
  numPointsPossible: number;
  override: { system: string; reason: string } | null;
  problemScores: { earned: number; possible: number }[];
  showGrades: boolean;
  url: string | null;
  [key: string]: unknown;
}

export interface CourseHomeProgressSectionScore {
  displayName: string;
  subsections: CourseHomeProgressSubsectionScore[];
  [key: string]: unknown;
}

export interface CourseHomeProgressAssignmentTypeGradeSummary {
  averageGrade: number;
  hasHiddenContribution: string;
  lastGradePublishDate: string | null;
  numDroppable: number;
  shortLabel: string;
  type: string;
  weight: number;
  weightedGrade: number;
  [key: string]: unknown;
}

// GET /api/course_home/v1/progress/. Every field is optional because the 401 and 403 branches return `{}`.
export interface CourseHomeProgress {
  accessExpiration?: CourseHomeAccessExpiration | null;
  assignmentTypeGradeSummary?: CourseHomeProgressAssignmentTypeGradeSummary[];
  certificateData?: {
    certStatus: string;
    certWebViewUrl: string | null;
    certificateAvailableDate: string | null;
    [key: string]: unknown;
  } | null;
  completionSummary?: { completeCount: number; incompleteCount: number; lockedCount: number };
  courseGrade?: { isPassing: boolean; letterGrade: string | null; percent: number };
  creditCourseRequirements?: {
    eligibilityStatus: string;
    requirements: {
      criteria: unknown;
      displayName: string;
      namespace: string;
      order: number;
      status: string;
      [key: string]: unknown;
    }[];
    [key: string]: unknown;
  } | null;
  disableProgressGraph?: boolean;
  end?: string | null;
  enrollmentMode?: string | null;
  finalGrades?: number;
  gradingPolicy?: { gradeRange: Record<string, number>; [key: string]: unknown };
  hasScheduledContent?: boolean | null;
  sectionScores?: CourseHomeProgressSectionScore[];
  studioUrl?: string | null;
  userHasPassingGrade?: boolean;
  username?: string;
  verificationData?: { link: string | null; status: string | null; [key: string]: unknown };
  verifiedMode?: { upgradeUrl: string; [key: string]: unknown } | null;
  // Computed here, not sent by the platform.
  gradesFeatureIsFullyLocked?: boolean;
  gradesFeatureIsPartiallyLocked?: boolean;
  [key: string]: unknown;
}

export async function getProgressTabData(courseId: string, targetUserId?: string): Promise<CourseHomeProgress> {
  let url = `${getConfig().LMS_BASE_URL}/api/course_home/progress/${courseId}`;

  // If targetUserId is passed in, we will get the progress page data
  // for the user with the provided id, rather than the requesting user.
  if (targetUserId) {
    url += `/${targetUserId}/`;
  }

  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    const camelCasedData = camelCaseObject(data);

    // We replace gradingPolicy.gradeRange with the original data to preserve the intended casing for the grade.
    // For example, if a grade range key is "A", we do not want it to be camel cased (i.e. "A" would become "a")
    // in order to preserve a course team's desired grade formatting.
    camelCasedData.gradingPolicy.gradeRange = data.grading_policy.grade_range;

    camelCasedData.gradesFeatureIsFullyLocked = camelCasedData.completionSummary.lockedCount > 0;

    camelCasedData.gradesFeatureIsPartiallyLocked = false;
    if (camelCasedData.gradesFeatureIsFullyLocked) {
      camelCasedData.sectionScores.forEach((chapter) => {
        chapter.subsections.forEach((subsection) => {
          // If something is eligible to be gated by content type gating and would show up on the progress page
          if (subsection.assignmentType !== null && subsection.hasGradedAssignment && subsection.showGrades
            && (subsection.numPointsPossible > 0 || subsection.numPointsEarned > 0)) {
            // but the learner still has access to it, then we are in a partially locked, rather than fully locked state
            // since the learner has access to some (but not all) content that would normally be locked
            if (subsection.learnerHasAccess) {
              camelCasedData.gradesFeatureIsPartiallyLocked = true;
              camelCasedData.gradesFeatureIsFullyLocked = false;
            }
          }
        });
      });
    }

    return camelCasedData;
  } catch (error) {
    const httpErrorStatus = getResponseStatus(error);
    if (httpErrorStatus === 401) {
      // The backend sends this for unenrolled and unauthenticated learners, but we handle those cases by examining
      // courseAccess in the metadata call, so just ignore this status for now.
      return {};
    }
    if (httpErrorStatus === 403) {
      // The backend sends this if there is a course access error and the user should be redirected. The redirect
      // info is included in the course metadata request and will be handled there as long as this call returns
      // without an error
      return {};
    }
    throw error;
  }
}

// The onboarding-status endpoint's raw response (snake_case, not camel-cased): edx-proctoring's
// `user_onboarding/status`, or edx-exams' `onboarding`. Every field is optional because the 404 branch
// returns `{}`.
export interface ProctoringInfo {
  expiration_date?: string | null;
  onboarding_link?: string;
  onboarding_past_due?: boolean;
  onboarding_release_date?: string;
  onboarding_status?: string;
  [key: string]: unknown;
}

export async function getProctoringInfoData(courseId: string, username?: string): Promise<ProctoringInfo> {
  let url;
  if (!getConfig().EXAMS_BASE_URL) {
    url = `${getConfig().LMS_BASE_URL}/api/edx_proctoring/v1/user_onboarding/status?is_learning_mfe=true&course_id=${encodeURIComponent(courseId)}`;
    if (username) {
      url += `&username=${encodeURIComponent(username)}`;
    }
  } else {
    url = `${getConfig().EXAMS_BASE_URL}/api/v1/student/course_id/${encodeURIComponent(courseId)}/onboarding`;
    if (username) {
      url += `?username=${encodeURIComponent(username)}`;
    }
  }
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return data;
  } catch (error) {
    const httpErrorStatus = getResponseStatus(error);
    if (httpErrorStatus === 404) {
      return {};
    }
    throw error;
  }
}

// GET /api/course_live/iframe/, raw (not camel-cased). `iframe` is absent when the live tab is disabled
// for the course (the view answers 200 with a `developer_message`), and the 404 branch returns `{}`.
export interface CourseLiveIframe {
  iframe?: string;
  [key: string]: unknown;
}

export async function getLiveTabIframe(courseId: string): Promise<CourseLiveIframe> {
  const url = `${getConfig().LMS_BASE_URL}/api/course_live/iframe/${courseId}/`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return data;
  } catch (error) {
    const httpErrorStatus = getResponseStatus(error);
    if (httpErrorStatus === 404) {
      return {};
    }
    throw error;
  }
}

export function getTimeOffsetMillis(headerDate: string | undefined, requestTime: number, responseTime: number): number {
  // Time offset computation should move down into the HttpClient wrapper to maintain a global time correction reference
  // Requires 'Access-Control-Expose-Headers: Date' on the server response per https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#access-control-expose-headers

  let timeOffsetMillis = 0;
  if (headerDate !== undefined) {
    const headerTime = Date.parse(headerDate);
    const roundTripMillis = requestTime - responseTime;
    const localTime = responseTime - (roundTripMillis / 2); // Roughly compensate for transit time
    timeOffsetMillis = headerTime - localTime;
  }

  return timeOffsetMillis;
}

export async function getOutlineTabData(courseId: string): Promise<CourseHomeOutline | Record<string, never>> {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/outline/${courseId}`;
  const requestTime = Date.now();
  let tabData;
  try {
    tabData = await getAuthenticatedHttpClient().get(url);
  } catch (error) {
    const httpErrorStatus = getResponseStatus(error);
    if (httpErrorStatus === 403) {
      // The backend sends this if there is a course access error and the user should be redirected. The redirect
      // info is included in the course metadata request and will be handled there as long as this call returns
      // without an error
      return {};
    }
    throw error;
  }

  const responseTime = Date.now();

  const {
    data,
    headers,
  } = tabData;

  const timeOffsetMillis = getTimeOffsetMillis(headers && headers.date, requestTime, responseTime);
  return normalizeCourseHomeOutline(courseId, data, timeOffsetMillis);
}

// The body of the reset-deadlines and post-event responses, shown as a toast.
export interface CallToActionResponse {
  header: string;
  link: string;
  link_text: string;
}

export async function postCourseDeadlines(courseId: string, model: string): Promise<{ data: CallToActionResponse }> {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_experience/v1/reset_course_deadlines`);
  return getAuthenticatedHttpClient().post(url.href, {
    course_key: courseId,
    research_event_data: { location: `${model}-tab` },
  });
}

export async function postWeeklyLearningGoal(
  courseId: string,
  daysPerWeek: number,
  subscribedToReminders: boolean,
): Promise<unknown> {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/save_course_goal`);
  return getAuthenticatedHttpClient().post(url.href, {
    course_id: courseId,
    days_per_week: daysPerWeek,
    subscribed_to_reminders: subscribedToReminders,
  });
}

export async function postDismissWelcomeMessage(courseId: string): Promise<void> {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/dismiss_welcome_message`);
  await getAuthenticatedHttpClient().post(url.href, { course_id: courseId });
}

export async function postRequestCert(courseId: string): Promise<void> {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/generate_user_cert`);
  await getAuthenticatedHttpClient().post(url.href);
}

export interface PostEventData {
  url: string;
  bodyParams: { courseId: string };
}

export async function executePostFromPostEvent(
  postData: PostEventData,
  researchEventData: unknown,
): Promise<{ data: CallToActionResponse }> {
  const url = new URL(postData.url);
  return getAuthenticatedHttpClient().post(url.href, {
    course_key: postData.bodyParams.courseId,
    research_event_data: researchEventData,
  });
}

// The whole http response, camel-cased; the caller reads its `data`.
export interface UnsubscribeFromCourseGoalResponse {
  data: { courseTitle?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export async function unsubscribeFromCourseGoal(token: string): Promise<UnsubscribeFromCourseGoalResponse> {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/unsubscribe_from_course_goal/${token}`);
  return getAuthenticatedHttpClient().post(url.href)
    .then(res => camelCaseObject(res));
}

export async function getCoursewareSearchEnabled(courseId: string): Promise<{ enabled: boolean }> {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/courseware-search/enabled/`);
  const { data } = await getAuthenticatedHttpClient().get(url.href);
  return { enabled: data.enabled || false };
}

// The whole http response, camel-cased; the caller hands its `data` to `mapSearchResponse`.
export interface CoursewareSearchResponse {
  data: unknown;
  [key: string]: unknown;
}

export async function searchCourseContentFromAPI(
  courseId: string,
  searchKeyword: string,
  options: { page?: number; limit?: number } = {},
): Promise<CoursewareSearchResponse> {
  const defaults = { page: 0, limit: 20 };
  const { page, limit } = { ...defaults, ...options };

  const url = new URL(`${getConfig().LMS_BASE_URL}/search/${courseId}`);
  const formData = `search_string=${searchKeyword}&page_size=${limit}&page_index=${page}`;
  const response = await getAuthenticatedHttpClient().post(url.href, formData);

  return camelCaseObject(response);
}

// One sequence's exam attempt: edx-proctoring's `proctored_exam/attempt`, or edx-exams' `exam/attempt`.
// Every field is optional because the 404 branch returns `{}`.
export interface ExamAttempt {
  exam?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function getExamsData(courseId: string, sequenceId: string): Promise<ExamAttempt> {
  let url;

  if (!getConfig().EXAMS_BASE_URL) {
    url = `${getConfig().LMS_BASE_URL}/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${encodeURIComponent(courseId)}?is_learning_mfe=true&content_id=${encodeURIComponent(sequenceId)}`;
  } else {
    url = `${getConfig().EXAMS_BASE_URL}/api/v1/student/exam/attempt/course_id/${encodeURIComponent(courseId)}/content_id/${encodeURIComponent(sequenceId)}`;
  }

  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(data);
  } catch (error) {
    const httpErrorStatus = getResponseStatus(error);
    if (httpErrorStatus === 404) {
      return {};
    }
    throw error;
  }
}
