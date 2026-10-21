import { camelCaseObject } from '@edx/frontend-platform';
import { logInfo } from '@edx/frontend-platform/logging';

import type { CourseHomeDateBlock } from './api';

// The outline (GET /api/course_home/v1/outline/), as `normalizeCourseHomeOutline` shapes it.

export interface CourseHomeOutlineCourse {
  id: string;
  title: string;
  sectionIds: string[];
  hasScheduledContent: boolean | null;
}

export interface CourseHomeOutlineSection {
  complete: boolean;
  id: string;
  title: string;
  resumeBlock: boolean;
  sequenceIds: string[];
  hideFromTOC: boolean | null;
  courseId?: string;
}

export interface CourseHomeOutlineSequence {
  complete: boolean;
  description: string | null;
  due: string | null;
  effortActivities: number | null;
  effortTime: number | null;
  icon: string | null;
  id: string;
  showLink: boolean;
  title: string;
  hideFromTOC: boolean | null;
  // Never in the response (see the input type); always `undefined`.
  navigationDisabled?: boolean;
  sectionId?: string;
}

export interface CourseHomeOutlineBlocks {
  courses: Record<string, CourseHomeOutlineCourse>;
  sections: Record<string, CourseHomeOutlineSection>;
  sequences: Record<string, CourseHomeOutlineSequence>;
}

// The nested objects name the fields this repo's readers use; the rest of each is left reachable as
// `unknown`. Their full shapes are openedx-platform's to describe.
export interface CourseHomeAccessExpiration {
  expirationDate: string;
  masqueradingExpiredCourse: boolean;
  upgradeDeadline: string | null;
  upgradeUrl: string | null;
  [key: string]: unknown;
}

export interface CourseHomeCertData {
  certStatus: string;
  certWebViewUrl: string | null;
  certificateAvailableDate: string | null;
  [key: string]: unknown;
}

export interface CourseHomeCourseGoals {
  selectedGoal: { daysPerWeek: number; subscribedToReminders: boolean } | null;
  weeklyLearningGoalEnabled: boolean;
  [key: string]: unknown;
}

export interface CourseHomeCourseTool {
  analyticsId: string;
  title: string;
  url: string;
  [key: string]: unknown;
}

export interface CourseHomeDatesBannerInfo {
  contentTypeGatingEnabled: boolean;
  missedDeadlines: boolean;
  missedGatedContent: boolean;
  verifiedUpgradeLink: string | null;
  [key: string]: unknown;
}

export interface CourseHomeDatesWidget {
  courseDateBlocks: CourseHomeDateBlock[];
  datesTabLink: string;
  [key: string]: unknown;
}

export interface CourseHomeEnrollAlert {
  canEnroll: boolean;
  extraText: string | null;
  [key: string]: unknown;
}

export interface CourseHomeResumeCourse {
  hasVisitedCourse: boolean;
  url: string | null;
  [key: string]: unknown;
}

export interface CourseHomeOutline {
  accessExpiration: CourseHomeAccessExpiration | null;
  certData: CourseHomeCertData | null;
  // `{}` when the response carries no `course_blocks` (an unenrolled learner on a course that is
  // neither public nor public-outline).
  courseBlocks: CourseHomeOutlineBlocks | Record<string, never>;
  courseGoals: CourseHomeCourseGoals;
  courseTools: CourseHomeCourseTool[];
  datesBannerInfo: CourseHomeDatesBannerInfo;
  datesWidget: CourseHomeDatesWidget;
  enrollAlert: CourseHomeEnrollAlert;
  enrollmentMode: string | null;
  enableProctoredExams: boolean;
  handoutsHtml: string | null;
  // Never in the response (see the input type); always `undefined`.
  hasScheduledContent?: boolean;
  hasEnded: boolean;
  offer: unknown;
  resumeCourse: CourseHomeResumeCourse;
  timeOffsetMillis: number;
  userHasPassingGrade: boolean;
  verifiedMode: unknown;
  welcomeMessageHtml: string;
}

// Names only the fields the normalizers read; the endpoint returns more, left reachable as `unknown`.

interface CourseHomeOutlineBlockResponse {
  id: string;
  type: string;
  display_name: string;
  children: string[];
  complete: boolean;
  description: string | null;
  due: string | null;
  effort_activities: number | null;
  effort_time: number | null;
  icon: string | null;
  lms_web_url: string | null;
  resume_block: boolean;
  has_scheduled_content: boolean | null;
  hide_from_toc: boolean | null;
  // Not emitted by the platform's `CourseBlockSerializer`; the normalizer reads it anyway.
  navigation_disabled?: boolean;
  [key: string]: unknown;
}

interface CourseHomeOutlineResponse {
  access_expiration: unknown;
  cert_data: unknown;
  course_blocks: { blocks: Record<string, CourseHomeOutlineBlockResponse> } | null;
  course_goals: unknown;
  course_tools: unknown;
  dates_banner_info: unknown;
  dates_widget: unknown;
  enable_proctored_exams: boolean;
  enroll_alert: unknown;
  enrollment_mode: string | null;
  handouts_html: string | null;
  // Not emitted by the platform's `OutlineTabView` at the top level (only per block); the normalizer
  // reads it anyway.
  has_scheduled_content?: boolean;
  has_ended: boolean;
  offer: unknown;
  resume_course: unknown;
  user_has_passing_grade: boolean;
  verified_mode: unknown;
  welcome_message_html: string | null;
  [key: string]: unknown;
}

export function normalizeCourseHomeOutlineBlocks(
  courseId: string,
  blocks: Record<string, CourseHomeOutlineBlockResponse>,
): CourseHomeOutlineBlocks {
  const models: CourseHomeOutlineBlocks = {
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
          hideFromTOC: block.hide_from_toc,
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
          hideFromTOC: block.hide_from_toc,
          navigationDisabled: block.navigation_disabled,
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

export function normalizeCourseHomeOutline(
  courseId: string,
  data: CourseHomeOutlineResponse,
  timeOffsetMillis: number,
): CourseHomeOutline {
  const accessExpiration = camelCaseObject(data.access_expiration);
  const certData = camelCaseObject(data.cert_data);
  const courseBlocks = data.course_blocks ? normalizeCourseHomeOutlineBlocks(courseId, data.course_blocks.blocks) : {};
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
  const userHasPassingGrade = data.user_has_passing_grade;
  const verifiedMode = camelCaseObject(data.verified_mode);
  const welcomeMessageHtml = data.welcome_message_html || '';

  return {
    accessExpiration,
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
