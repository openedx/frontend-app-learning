/* eslint-disable import/prefer-default-export */
import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';

function normalizeMetadata(metadata) {
  return {
    id: metadata.id,
    title: metadata.name,
    number: metadata.number,
    org: metadata.org,
    enrollmentStart: metadata.enrollment_start,
    enrollmentEnd: metadata.enrollment_end,
    end: metadata.end,
    start: metadata.start,
    enrollmentMode: metadata.enrollment.mode,
    isEnrolled: metadata.enrollment.is_active,
    userHasAccess: metadata.user_has_access,
    isStaff: metadata.user_has_staff_access,
    verifiedMode: camelCaseObject(metadata.verified_mode),
    tabs: camelCaseObject(metadata.tabs),
  };
}

export async function getCourseMetadata(courseUsageKey) {
  const url = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseUsageKey}`;
  const { data } = await getAuthenticatedHttpClient().get(url);
  return normalizeMetadata(data);
}


function normalizeBlocks(courseUsageKey, blocks) {
  const models = {
    courses: {},
    sections: {},
    sequences: {},
    units: {},
  };
  Object.values(blocks).forEach(block => {
    if (block.type === 'course') {
      models.courses[block.id] = {
        id: courseUsageKey,
        title: block.display_name,
        sectionIds: block.children,
      };
    } else if (block.type === 'chapter') {
      models.sections[block.id] = {
        id: block.id,
        title: block.display_name,
        sequenceIds: block.children,
      };
    } else if (block.type === 'sequential') {
      models.sequences[block.id] = {
        id: block.id,
        title: block.display_name,
        lmsWebUrl: block.lms_web_url,
        unitIds: block.children,
      };
    } else if (block.type === 'vertical') {
      models.units[block.id] = {
        id: block.id,
        title: block.display_name,
      };
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

export async function getCourseBlocks(courseUsageKey) {
  const { username } = getAuthenticatedUser();
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/`);
  url.searchParams.append('course_id', courseUsageKey);
  url.searchParams.append('username', username);
  url.searchParams.append('depth', 3);
  url.searchParams.append('requested_fields', 'children,show_gated_sections');

  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  return normalizeBlocks(courseUsageKey, data.blocks);
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

const getSequenceXModuleHandlerUrl = (courseUsageKey, sequenceId) => `${getConfig().LMS_BASE_URL}/courses/${courseUsageKey}/xblock/${sequenceId}/handler/xmodule_handler`;

export async function getBlockCompletion(courseUsageKey, sequenceId, usageKey) {
  // Post data sent to this endpoint must be url encoded
  // TODO: Remove the need for this to be the case.
  // TODO: Ensure this usage of URLSearchParams is working in Internet Explorer
  const urlEncoded = new URLSearchParams();
  urlEncoded.append('usage_key', usageKey);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceXModuleHandlerUrl(courseUsageKey, sequenceId)}/get_completion`,
    urlEncoded.toString(),
    requestConfig,
  );

  if (data.complete) {
    return true;
  }

  return false;
}

export async function updateSequencePosition(courseUsageKey, sequenceId, position) {
  // Post data sent to this endpoint must be url encoded
  // TODO: Remove the need for this to be the case.
  // TODO: Ensure this usage of URLSearchParams is working in Internet Explorer
  const urlEncoded = new URLSearchParams();
  // Position is 1-indexed on the server and 0-indexed in this app. Adjust here.
  urlEncoded.append('position', position + 1);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceXModuleHandlerUrl(courseUsageKey, sequenceId)}/goto_position`,
    urlEncoded.toString(),
    requestConfig,
  );

  return data;
}

const bookmarksBaseUrl = `${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/`;

export async function createBookmark(usageId) {
  return getAuthenticatedHttpClient().post(bookmarksBaseUrl, { usage_id: usageId });
}

export async function deleteBookmark(usageId) {
  const { username } = getAuthenticatedUser();
  return getAuthenticatedHttpClient().delete(`${bookmarksBaseUrl}${username},${usageId}/`);
}
