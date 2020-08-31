import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
// TODO: Pull this normalization function up so we're not reaching into courseware
import { normalizeBlocks } from '../../courseware/data/api';

function normalizeCourseHomeCourseMetadata(metadata) {
  const data = camelCaseObject(metadata);
  return {
    ...data,
    tabs: data.tabs.map(tab => ({
      slug: tab.tabId,
      title: tab.title,
      url: tab.url,
    })),
  };
}

export async function getCourseHomeCourseMetadata(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/${courseId}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return normalizeCourseHomeCourseMetadata(data);
}

export async function getDatesTabData(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/v1/dates/${courseId}`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(data);
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      global.location.replace(`${getConfig().LMS_BASE_URL}/courses/${courseId}/dates`);
      return {};
    }
    throw error;
  }
}

export async function getProgressTabData(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/v1/progress/${courseId}`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(data);
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      global.location.replace(`${getConfig().LMS_BASE_URL}/courses/${courseId}/progress`);
      return {};
    }
    throw error;
  }
}

export async function getOutlineTabData(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/v1/outline/${courseId}`;
  let { tabData } = {};
  try {
    tabData = await getAuthenticatedHttpClient().get(url);
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      global.location.replace(`${getConfig().LMS_BASE_URL}/courses/${courseId}/course/`);
      return {};
    }
    throw error;
  }

  const {
    data,
  } = tabData;
  const courseBlocks = normalizeBlocks(courseId, data.course_blocks.blocks);
  const courseGoals = camelCaseObject(data.course_goals);
  const courseExpiredHtml = data.course_expired_html;
  const courseTools = camelCaseObject(data.course_tools);
  const datesWidget = camelCaseObject(data.dates_widget);
  const enrollAlert = camelCaseObject(data.enroll_alert);
  const handoutsHtml = data.handouts_html;
  const offerHtml = data.offer_html;
  const resumeCourse = camelCaseObject(data.resume_course);
  const welcomeMessageHtml = data.welcome_message_html;

  return {
    courseBlocks,
    courseGoals,
    courseExpiredHtml,
    courseTools,
    datesWidget,
    enrollAlert,
    handoutsHtml,
    offerHtml,
    resumeCourse,
    welcomeMessageHtml,
  };
}

export async function postCourseDeadlines(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_experience/v1/reset_course_deadlines`);
  return getAuthenticatedHttpClient().post(url.href, { course_key: courseId });
}

export async function postCourseGoals(courseId, goalKey) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/v1/save_course_goal`);
  return getAuthenticatedHttpClient().post(url.href, { course_id: courseId, goal_key: goalKey });
}

export async function postDismissWelcomeMessage(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/v1/dismiss_welcome_message`);
  await getAuthenticatedHttpClient().post(url.href, { course_id: courseId });
}

export async function postRequestCert(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/generate_user_cert`);
  await getAuthenticatedHttpClient().post(url.href);
}

export async function executePostFromPostEvent(postData) {
  const url = new URL(postData.url);
  return getAuthenticatedHttpClient().post(url.href, { course_key: postData.bodyParams.courseId });
}
