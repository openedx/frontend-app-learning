import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { normalizeBlocks } from '../../data';

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

export async function getOutlineTabData(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/v1/outline/${courseId}`;
  let { tabData } = {};
  try {
    tabData = await getAuthenticatedHttpClient().get(url);
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      global.location.replace(`${getConfig().LMS_BASE_URL}/courses/${courseId}/home`);
      return {};
    }
    throw error;
  }

  const {
    data,
  } = tabData;
  const courseBlocks = normalizeBlocks(courseId, data.course_blocks.blocks);
  const courseTools = camelCaseObject(data.course_tools);
  const datesWidget = camelCaseObject(data.dates_widget);

  return { courseTools, courseBlocks, datesWidget };
}

export async function postCourseDeadlines(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_experience/v1/reset_course_deadlines`);
  await getAuthenticatedHttpClient().post(url.href, { course_key: courseId });
}
