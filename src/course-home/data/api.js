import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logInfo } from '@edx/frontend-platform/logging';
import { appendBrowserTimezoneToUrl } from '../../utils';

const calculateAssignmentTypeGrades = (points, assignmentWeight, numDroppable) => {
  let dropCount = numDroppable;
  // Drop the lowest grades
  while (dropCount && points.length >= dropCount) {
    const lowestScore = Math.min(...points);
    const lowestScoreIndex = points.indexOf(lowestScore);
    points.splice(lowestScoreIndex, 1);
    dropCount--;
  }
  let averageGrade = 0;
  let weightedGrade = 0;
  if (points.length) {
    // Calculate the average grade for the assignment and round it. This rounding is not ideal and does not accurately
    // reflect what a learner's grade would be, however, we must have parity with the current grading behavior that
    // exists in edx-platform.
    averageGrade = (points.reduce((a, b) => a + b, 0) / points.length).toFixed(2);
    weightedGrade = averageGrade * assignmentWeight;
  }
  return { averageGrade, weightedGrade };
};

function normalizeAssignmentPolicies(assignmentPolicies, sectionScores) {
  const gradeByAssignmentType = {};
  assignmentPolicies.forEach(assignment => {
    // Create an array with the number of total assignments and set the scores to 0
    // as placeholders for assignments that have not yet been released
    gradeByAssignmentType[assignment.type] = {
      grades: Array(assignment.numTotal).fill(0),
      numAssignmentsCreated: 0,
      numTotalExpectedAssignments: assignment.numTotal,
    };
  });

  sectionScores.forEach((chapter) => {
    chapter.subsections.forEach((subsection) => {
      if (!(subsection.hasGradedAssignment && subsection.showGrades && subsection.numPointsPossible)) {
        return;
      }
      const {
        assignmentType,
        numPointsEarned,
        numPointsPossible,
      } = subsection;

      // If a subsection's assignment type does not match an assignment policy in Studio,
      // we won't be able to include it in this accumulation of grades by assignment type.
      // This may happen if a course author has removed/renamed an assignment policy in Studio and
      // neglected to update the subsection's of that assignment type
      if (!gradeByAssignmentType[assignmentType]) {
        return;
      }

      let {
        numAssignmentsCreated,
      } = gradeByAssignmentType[assignmentType];

      numAssignmentsCreated++;
      if (numAssignmentsCreated <= gradeByAssignmentType[assignmentType].numTotalExpectedAssignments) {
        // Remove a placeholder grade so long as the number of recorded created assignments is less than the number
        // of expected assignments
        gradeByAssignmentType[assignmentType].grades.shift();
      }
      // Add the graded assignment to the list
      gradeByAssignmentType[assignmentType].grades.push(numPointsEarned ? numPointsEarned / numPointsPossible : 0);
      // Record the created assignment
      gradeByAssignmentType[assignmentType].numAssignmentsCreated = numAssignmentsCreated;
    });
  });

  return assignmentPolicies.map((assignment) => {
    const { averageGrade, weightedGrade } = calculateAssignmentTypeGrades(
      gradeByAssignmentType[assignment.type].grades,
      assignment.weight,
      assignment.numDroppable,
    );

    return {
      averageGrade,
      numDroppable: assignment.numDroppable,
      shortLabel: assignment.shortLabel,
      type: assignment.type,
      weight: assignment.weight,
      weightedGrade,
    };
  });
}

/**
 * Tweak the metadata for consistency
 * @param metadata the data to normalize
 * @param rootSlug either 'courseware' or 'outline' depending on the context
 * @returns {Object} The normalized metadata
 */
function normalizeCourseHomeCourseMetadata(metadata, rootSlug) {
  const data = camelCaseObject(metadata);
  return {
    ...data,
    tabs: data.tabs.map(tab => ({
      // The API uses "courseware" as a slug for both courseware and the outline tab.
      // If needed, we switch it to "outline" here for
      // use within the MFE to differentiate between course home and courseware.
      slug: tab.tabId === 'courseware' ? rootSlug : tab.tabId,
      title: tab.title,
      url: tab.url,
    })),
    isMasquerading: data.originalUserIsStaff && !data.isStaff,
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
          hasScheduledContent: block.has_scheduled_content,
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
          effortActivities: block.effort_activities,
          effortTime: block.effort_time,
          icon: block.icon,
          id: block.id,
          // The presence of a URL for the sequence indicates that we want this sequence to be a clickable
          // link in the outline (even though we ignore the given url and use an internal <Link> to ourselves).
          showLink: !!block.lms_web_url,
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

export async function getCourseHomeCourseMetadata(courseId, rootSlug) {
  let url = `${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`;
  url = appendBrowserTimezoneToUrl(url);
  const { data } = await getAuthenticatedHttpClient().get(url);
  return normalizeCourseHomeCourseMetadata(data, rootSlug);
}

// For debugging purposes, you might like to see a fully loaded dates tab.
// Just uncomment the next few lines and the immediate 'return' in the function below
// import { Factory } from 'rosie';
// import './__factories__';
export async function getDatesTabData(courseId) {
  // return camelCaseObject(Factory.build('datesTabData'));
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/dates/${courseId}`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(data);
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 401) {
      // The backend sends this for unenrolled and unauthenticated learners, but we handle those cases by examining
      // courseAccess in the metadata call, so just ignore this status for now.
      return {};
    }
    throw error;
  }
}

export async function getProgressTabData(courseId, targetUserId) {
  let url = `${getConfig().LMS_BASE_URL}/api/course_home/progress/${courseId}`;

  // If targetUserId is passed in, we will get the progress page data
  // for the user with the provided id, rather than the requesting user.
  if (targetUserId) {
    url += `/${targetUserId}/`;
  }

  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    const camelCasedData = camelCaseObject(data);

    camelCasedData.gradingPolicy.assignmentPolicies = normalizeAssignmentPolicies(
      camelCasedData.gradingPolicy.assignmentPolicies,
      camelCasedData.sectionScores,
    );

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
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      global.location.replace(`${getConfig().LMS_BASE_URL}/courses/${courseId}/progress`);
      return {};
    }
    if (httpErrorStatus === 401) {
      // The backend sends this for unenrolled and unauthenticated learners, but we handle those cases by examining
      // courseAccess in the metadata call, so just ignore this status for now.
      return {};
    }
    throw error;
  }
}

export async function getProctoringInfoData(courseId, username) {
  let url = `${getConfig().LMS_BASE_URL}/api/edx_proctoring/v1/user_onboarding/status?is_learning_mfe=true&course_id=${encodeURIComponent(courseId)}`;
  if (username) {
    url += `&username=${encodeURIComponent(username)}`;
  }
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return data;
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      return {};
    }
    throw error;
  }
}

export async function getLiveTabIframe(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_live/iframe/${courseId}/`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    return data;
  } catch (error) {
    const { httpErrorStatus } = error && error.customAttributes;
    if (httpErrorStatus === 404) {
      return {};
    }
    throw error;
  }
}

export function getTimeOffsetMillis(headerDate, requestTime, responseTime) {
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

export async function getOutlineTabData(courseId) {
  const url = `${getConfig().LMS_BASE_URL}/api/course_home/outline/${courseId}`;
  const requestTime = Date.now();
  const tabData = await getAuthenticatedHttpClient().get(url);
  const responseTime = Date.now();

  const {
    data,
    headers,
  } = tabData;

  const accessExpiration = camelCaseObject(data.access_expiration);
  const canShowUpgradeSock = data.can_show_upgrade_sock;
  const certData = camelCaseObject(data.cert_data);
  const courseBlocks = data.course_blocks ? normalizeOutlineBlocks(courseId, data.course_blocks.blocks) : {};
  const courseGoals = camelCaseObject(data.course_goals);
  const courseTools = camelCaseObject(data.course_tools);
  const datesBannerInfo = camelCaseObject(data.dates_banner_info);
  const datesWidget = camelCaseObject(data.dates_widget);
  const enableProctoredExams = data.enable_proctored_exams;
  const enrollAlert = camelCaseObject(data.enroll_alert);
  const enrollmentMode = data.enrollment_mode;
  const handoutsHtml = data.handouts_html;
  const hasScheduledContent = data.has_scheduled_content;
  const hasEnded = data.has_ended;
  const offer = camelCaseObject(data.offer);
  const resumeCourse = camelCaseObject(data.resume_course);
  const timeOffsetMillis = getTimeOffsetMillis(headers && headers.date, requestTime, responseTime);
  const userHasPassingGrade = data.user_has_passing_grade;
  const verifiedMode = camelCaseObject(data.verified_mode);
  const welcomeMessageHtml = data.welcome_message_html;

  return {
    accessExpiration,
    canShowUpgradeSock,
    certData,
    courseBlocks,
    courseGoals,
    courseTools,
    datesBannerInfo,
    datesWidget,
    enrollAlert,
    enrollmentMode,
    enableProctoredExams,
    handoutsHtml,
    hasScheduledContent,
    hasEnded,
    offer,
    resumeCourse,
    timeOffsetMillis, // This should move to a global time correction reference
    userHasPassingGrade,
    verifiedMode,
    welcomeMessageHtml,
  };
}

export async function postCourseDeadlines(courseId, model) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_experience/v1/reset_course_deadlines`);
  return getAuthenticatedHttpClient().post(url.href, {
    course_key: courseId,
    research_event_data: { location: `${model}-tab` },
  });
}

export async function deprecatedPostCourseGoals(courseId, goalKey) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/save_course_goal`);
  return getAuthenticatedHttpClient().post(url.href, { course_id: courseId, goal_key: goalKey });
}

export async function postWeeklyLearningGoal(courseId, daysPerWeek, subscribedToReminders) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/save_course_goal`);
  return getAuthenticatedHttpClient().post(url.href, {
    course_id: courseId,
    days_per_week: daysPerWeek,
    subscribed_to_reminders: subscribedToReminders,
  });
}

export async function postDismissWelcomeMessage(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/dismiss_welcome_message`);
  await getAuthenticatedHttpClient().post(url.href, { course_id: courseId });
}

export async function postRequestCert(courseId) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/generate_user_cert`);
  await getAuthenticatedHttpClient().post(url.href);
}

export async function executePostFromPostEvent(postData, researchEventData) {
  const url = new URL(postData.url);
  return getAuthenticatedHttpClient().post(url.href, {
    course_key: postData.bodyParams.courseId,
    research_event_data: researchEventData,
  });
}

export async function unsubscribeFromCourseGoal(token) {
  const url = new URL(`${getConfig().LMS_BASE_URL}/api/course_home/unsubscribe_from_course_goal/${token}`);
  return getAuthenticatedHttpClient().post(url.href)
    .then(res => camelCaseObject(res));
}
