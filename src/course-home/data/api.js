import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logInfo } from '@edx/frontend-platform/logging';

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

export function normalizeOutlineBlocks(courseId, blocks) {
  const models = {
    courses: {},
    sections: {},
    sequences: {},
  };
  Object.values(blocks).forEach(block => {
    switch (block.type) {
      case 'course':
        models.courses[block.id] = {
          id: courseId,
          title: block.display_name,
          sectionIds: block.children || [],
        };
        break;

      case 'chapter':
        models.sections[block.id] = {
          complete: block.complete,
          id: block.id,
          title: block.display_name,
          resumeBlock: block.resume_block,
          sequenceIds: block.children || [],
        };
        break;

      case 'sequential':
        models.sequences[block.id] = {
          complete: block.complete,
          description: block.description,
          due: block.due,
          icon: block.icon,
          id: block.id,
          showLink: !!block.lms_web_url, // we reconstruct the url ourselves as an MFE-internal <Link>
          title: block.display_name,
        };
        break;

      default:
        logInfo(`Unexpected course block type: ${block.type} with ID ${block.id}.  Expected block types are course, chapter, and sequential.`);
    }
  });

  // Next go through each list and use their child lists to decorate those children with a
  // reference back to their parent.
  Object.values(models.courses).forEach(course => {
    if (Array.isArray(course.sectionIds)) {
      course.sectionIds.forEach(sectionId => {
        const section = models.sections[sectionId];
        section.courseId = course.id;
      });
    }
  });

  Object.values(models.sections).forEach(section => {
    if (Array.isArray(section.sequenceIds)) {
      section.sequenceIds.forEach(sequenceId => {
        if (sequenceId in models.sequences) {
          models.sequences[sequenceId].sectionId = section.id;
        } else {
          logInfo(`Section ${section.id} has child block ${sequenceId}, but that block is not in the list of sequences.`);
        }
      });
    }
  });

  return models;
}

export async function getCourseHomeCourseMetadata(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/${courseId}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return normalizeCourseHomeCourseMetadata(data);
}

// For debugging purposes, you might like to see a fully loaded dates tab.
// Just uncomment the next few lines and the immediate 'return' in the function below
// import { Factory } from 'rosie';
// import './__factories__';
export async function getDatesTabData(courseId) {
  // return camelCaseObject(Factory.build('datesTabData'));
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
  const courseBlocks = data.course_blocks ? normalizeOutlineBlocks(courseId, data.course_blocks.blocks) : {};
  const courseGoals = camelCaseObject(data.course_goals);
  const courseExpiredHtml = data.course_expired_html;
  const courseTools = camelCaseObject(data.course_tools);
  const datesBannerInfo = camelCaseObject(data.dates_banner_info);
  const datesWidget = camelCaseObject(data.dates_widget);
  const enrollAlert = camelCaseObject(data.enroll_alert);
  const handoutsHtml = data.handouts_html;
  const hasEnded = data.has_ended;
  const offerHtml = data.offer_html;
  const resumeCourse = camelCaseObject(data.resume_course);
  const welcomeMessageHtml = data.welcome_message_html;

  return {
    courseBlocks,
    courseGoals,
    courseExpiredHtml,
    courseTools,
    datesBannerInfo,
    datesWidget,
    enrollAlert,
    handoutsHtml,
    hasEnded,
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
