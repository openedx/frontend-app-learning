/* eslint-disable import/prefer-default-export */
import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

function normalizeTabUrls(id, tabs) {
  // If api doesn't return the mfe base url, change tab url to point back to LMS
  return tabs.map((tab) => {
    let { url } = tab;
    if (url[0] === '/') {
      url = `${getConfig().LMS_BASE_URL}${tab.url}`;
    }
    return { ...tab, url };
  });
}

function normalizeMetadata(metadata) {
  return {
    canShowUpgradeSock: metadata.can_show_upgrade_sock,
    contentTypeGatingEnabled: metadata.content_type_gating_enabled,
    // TODO: TNL-7185: return course expired _date_, instead of _message_
    courseExpiredMessage: metadata.course_expired_message,
    id: metadata.id,
    title: metadata.name,
    number: metadata.number,
    offerHtml: metadata.offer_html,
    org: metadata.org,
    enrollmentStart: metadata.enrollment_start,
    enrollmentEnd: metadata.enrollment_end,
    end: metadata.end,
    start: metadata.start,
    enrollmentMode: metadata.enrollment.mode,
    isEnrolled: metadata.enrollment.is_active,
    canLoadCourseware: camelCaseObject(metadata.can_load_courseware),
    isStaff: metadata.is_staff,
    verifiedMode: camelCaseObject(metadata.verified_mode),
    tabs: normalizeTabUrls(metadata.id, camelCaseObject(metadata.tabs)),
    showCalculator: metadata.show_calculator,
    notes: camelCaseObject(metadata.notes),
  };
}

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

export async function getCourseMetadata(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return normalizeMetadata(data);
}

export async function getCourseHomeCourseMetadata(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/${courseId}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return normalizeCourseHomeCourseMetadata(data);
}

export async function getDatesTabData(courseId, version) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/${version}/dates/${courseId}`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(data);
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      return window.location.replace(`${getConfig().LMS_BASE_URL}/courses/${courseId}/dates`);
    }
    // async functions expect return values. to satisfy that requirement
    // we return true here which in turn continues with the normal flow of displaying
    // the "unexpected error try again" screen to the user.
    return true;
  }
}

function normalizeBlocks(courseId, blocks) {
  const models = {
    courses: {},
    sections: {},
    sequences: {},
    units: {},
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
          id: block.id,
          title: block.display_name,
          sequenceIds: block.children || [],
        };
        break;

      case 'sequential':
        models.sequences[block.id] = {
          id: block.id,
          title: block.display_name,
          lmsWebUrl: block.lms_web_url,
          unitIds: block.children || [],
        };
        break;
      case 'vertical':
        models.units[block.id] = {
          graded: block.graded,
          id: block.id,
          title: block.display_name,
          lmsWebUrl: block.lms_web_url,
        };
        break;
      default:
        logError(`Unexpected course block type: ${block.type} with ID ${block.id}.  Expected block types are course, chapter, sequential, and vertical.`);
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
        models.sequences[sequenceId].sectionId = section.id;
      });
    }
  });

  Object.values(models.sequences).forEach(sequence => {
    if (Array.isArray(sequence.unitIds)) {
      sequence.unitIds.forEach(unitId => {
        models.units[unitId].sequenceId = sequence.id;
      });
    }
  });

  return models;
}

export async function getCourseBlocks(courseId) {
  const { username } = getAuthenticatedUser();
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/`);
  url.searchParams.append('course_id', courseId);
  url.searchParams.append('username', username);
  url.searchParams.append('depth', 3);
  url.searchParams.append('requested_fields', 'children,show_gated_sections,graded');

  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  return normalizeBlocks(courseId, data.blocks);
}

export async function getOutlineTabData(courseId, version) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/${version}/outline/${courseId}`;
  let { tabData } = {};
  try {
    tabData = await getAuthenticatedHttpClient().get(url);
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      return window.location.replace(`${getConfig().LMS_BASE_URL}/courses/${courseId}/course`);
    }
  }

  const {
    data,
  } = tabData;
  const courseBlocks = normalizeBlocks(courseId, data.course_blocks.blocks);
  const courseTools = camelCaseObject(data.course_tools);

  return { courseTools, courseBlocks };
}

function normalizeSequenceMetadata(sequence) {
  return {
    sequence: {
      id: sequence.item_id,
      unitIds: sequence.items.map(unit => unit.id),
      bannerText: sequence.banner_text,
      title: sequence.display_name,
      gatedContent: camelCaseObject(sequence.gated_content),
      isTimeLimited: sequence.is_time_limited,
      // Position comes back from the server 1-indexed. Adjust here.
      activeUnitIndex: sequence.position ? sequence.position - 1 : 0,
      saveUnitPosition: sequence.save_position,
      showCompletion: sequence.show_completion,
    },
    units: sequence.items.map(unit => ({
      id: unit.id,
      sequenceId: sequence.item_id,
      bookmarked: unit.bookmarked,
      complete: unit.complete,
      title: unit.page_title,
      contentType: unit.type,
    })),
  };
}

export async function getSequenceMetadata(sequenceId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceId}`, {});

  return normalizeSequenceMetadata(data);
}

export async function getResumeBlock(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`);
  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  return camelCaseObject(data);
}

export async function getMasqueradeOptions(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/masquerade`);
  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  return camelCaseObject(data);
}

export async function postMasqueradeOptions(courseId, data) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/masquerade`);
  const { response } = await getAuthenticatedHttpClient().post(url.href, data);
  return camelCaseObject(response);
}

export async function updateCourseDeadlines(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_experience/v1/reset_course_deadlines`);
  await getAuthenticatedHttpClient().post(url.href, { course_key: courseId });
}
