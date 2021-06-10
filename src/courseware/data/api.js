import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { logInfo } from '@edx/frontend-platform/logging';
import { appendBrowserTimezoneToUrl } from '../../utils';

export function normalizeBlocks(courseId, blocks) {
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
          effortActivities: block.effort_activities,
          effortTime: block.effort_time,
          id: courseId,
          title: block.display_name,
          sectionIds: block.children || [],
          hasScheduledContent: block.has_scheduled_content || false,
        };
        break;
      case 'chapter':
        models.sections[block.id] = {
          effortActivities: block.effort_activities,
          effortTime: block.effort_time,
          id: block.id,
          title: block.display_name,
          sequenceIds: block.children || [],
        };
        break;

      case 'sequential':
        models.sequences[block.id] = {
          effortActivities: block.effort_activities,
          effortTime: block.effort_time,
          id: block.id,
          title: block.display_name,
          legacyWebUrl: block.legacy_web_url,
          unitIds: block.children || [],
        };
        break;
      case 'vertical':
        models.units[block.id] = {
          graded: block.graded,
          id: block.id,
          title: block.display_name,
          legacyWebUrl: block.legacy_web_url,
        };
        break;
      default:
        logInfo(`Unexpected course block type: ${block.type} with ID ${block.id}.  Expected block types are course, chapter, sequential, and vertical.`);
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

  Object.values(models.sequences).forEach(sequence => {
    if (Array.isArray(sequence.unitIds)) {
      sequence.unitIds.forEach(unitId => {
        if (unitId in models.units) {
          models.units[unitId].sequenceId = sequence.id;
        } else {
          logInfo(`Sequence ${sequence.id} has child block ${unitId}, but that block is not in the list of units.`);
        }
      });
    }
  });

  return models;
}

export async function getCourseBlocks(courseId) {
  const authenticatedUser = getAuthenticatedUser();
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courses/v2/blocks/`);
  url.searchParams.append('course_id', courseId);
  url.searchParams.append('username', authenticatedUser ? authenticatedUser.username : '');
  url.searchParams.append('depth', 3);
  url.searchParams.append('requested_fields', 'children,effort_activities,effort_time,show_gated_sections,graded,special_exam_info,has_scheduled_content');

  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  return normalizeBlocks(courseId, data.blocks);
}

// Returns the output of the Learning Sequences API, or null if that API is not
// currently available for this user in this course.
export async function getLearningSequencesOutline(courseId) {
  const outlineUrl = new URL(`${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/${courseId}`);

  try {
    const { data } = await getAuthenticatedHttpClient().get(outlineUrl.href, {});
    return data;
  } catch (error) {
    // This is not a critical API to use at the moment. If it errors for any
    // reason, just send back a null so the higher layers know to ignore it.
    if (error.response) {
      if (error.response.status === 403) {
        logInfo('Learning Sequences API not enabled for this user.');
      } else {
        logInfo(`Unexpected error calling Learning Sequences API (${error.response.status}). Ignoring.`);
      }
      return null;
    }
    throw error;
  }
}

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
    accessExpiration: camelCaseObject(metadata.access_expiration),
    canShowUpgradeSock: metadata.can_show_upgrade_sock,
    contentTypeGatingEnabled: metadata.content_type_gating_enabled,
    id: metadata.id,
    title: metadata.name,
    number: metadata.number,
    offer: camelCaseObject(metadata.offer),
    org: metadata.org,
    enrollmentStart: metadata.enrollment_start,
    enrollmentEnd: metadata.enrollment_end,
    end: metadata.end,
    start: metadata.start,
    enrollmentMode: metadata.enrollment.mode,
    isEnrolled: metadata.enrollment.is_active,
    canLoadCourseware: camelCaseObject(metadata.can_load_courseware),
    canViewLegacyCourseware: metadata.can_view_legacy_courseware,
    originalUserIsStaff: metadata.original_user_is_staff,
    isStaff: metadata.is_staff,
    license: metadata.license,
    verifiedMode: camelCaseObject(metadata.verified_mode),
    tabs: normalizeTabUrls(metadata.id, camelCaseObject(metadata.tabs)),
    userTimezone: metadata.user_timezone,
    showCalculator: metadata.show_calculator,
    notes: camelCaseObject(metadata.notes),
    marketingUrl: metadata.marketing_url,
    celebrations: camelCaseObject(metadata.celebrations),
    userHasPassingGrade: metadata.user_has_passing_grade,
    courseExitPageIsActive: metadata.course_exit_page_is_active,
    certificateData: camelCaseObject(metadata.certificate_data),
    verifyIdentityUrl: metadata.verify_identity_url,
    verificationStatus: metadata.verification_status,
    linkedinAddToProfileUrl: metadata.linkedin_add_to_profile_url,
    relatedPrograms: camelCaseObject(metadata.related_programs),
    userNeedsIntegritySignature: metadata.user_needs_integrity_signature,
    specialExamsEnabledWaffleFlag: metadata.is_mfe_special_exams_enabled,
    proctoredExamsEnabledWaffleFlag: metadata.is_mfe_proctored_exams_enabled,
  };
}

export async function getCourseMetadata(courseId) {
  let url = `${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`;
  url = appendBrowserTimezoneToUrl(url);
  const { data } = await getAuthenticatedHttpClient().get(url);
  return normalizeMetadata(data);
}

function normalizeSequenceMetadata(sequence) {
  return {
    sequence: {
      id: sequence.item_id,
      blockType: sequence.tag,
      unitIds: sequence.items.map(unit => unit.id),
      bannerText: sequence.banner_text,
      format: sequence.format,
      title: sequence.display_name,
      /*
      Example structure of gated_content when prerequisites exist:
      {
        prereq_id: 'id of the prereq section',
        prereq_url: 'unused by this frontend',
        prereq_section_name: 'Name of the prerequisite section',
        gated: true,
        gated_section_name: 'Name of this gated section',
      */
      gatedContent: camelCaseObject(sequence.gated_content),
      isTimeLimited: sequence.is_time_limited,
      isProctored: sequence.is_proctored,
      // Position comes back from the server 1-indexed. Adjust here.
      activeUnitIndex: sequence.position ? sequence.position - 1 : 0,
      saveUnitPosition: sequence.save_position,
      showCompletion: sequence.show_completion,
      allowProctoringOptOut: sequence.allow_proctoring_opt_out,
    },
    units: sequence.items.map(unit => ({
      id: unit.id,
      sequenceId: sequence.item_id,
      bookmarked: unit.bookmarked,
      complete: unit.complete,
      title: unit.page_title,
      contentType: unit.type,
      graded: unit.graded,
      containsContentTypeGatedContent: unit.contains_content_type_gated_content,
    })),
  };
}

export async function getSequenceMetadata(sequenceId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courseware/sequence/${sequenceId}`, {});

  return normalizeSequenceMetadata(data);
}

const getSequenceHandlerUrl = (courseId, sequenceId) => `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler`;

export async function getBlockCompletion(courseId, sequenceId, usageKey) {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceHandlerUrl(courseId, sequenceId)}/get_completion`,
    { usage_key: usageKey },
  );
  return data.complete === true;
}

export async function postSequencePosition(courseId, sequenceId, activeUnitIndex) {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceHandlerUrl(courseId, sequenceId)}/goto_position`,
    // Position is 1-indexed on the server and 0-indexed in this app. Adjust here.
    { position: activeUnitIndex + 1 },
  );
  return data;
}

export async function getResumeBlock(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/courseware/resume/${courseId}`);
  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  return camelCaseObject(data);
}

export async function postIntegritySignature(courseId) {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getConfig().LMS_BASE_URL}/api/agreements/v1/integrity_signature/${courseId}`, {},
  );
  return camelCaseObject(data);
}
export async function sendActivationEmail() {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/send_account_activation_email`);
  const { data } = await getAuthenticatedHttpClient().post(url.href, {});
  return data;
}
