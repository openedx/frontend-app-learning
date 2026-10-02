import { camelCaseObject } from '@edx/frontend-platform';

import { getTimeOffsetMillis } from '../../course-home/data/api';

// The courseware metadata (GET /api/courseware/course/), as `normalizeCoursewareMeta` shapes it.

// The camel-cased sub-objects stay `unknown` until a reader names their fields.
export interface CoursewareMeta {
  accessExpiration: unknown;
  contentTypeGatingEnabled: boolean;
  courseGoals: unknown;
  id: string;
  offer: unknown;
  enrollmentStart: string | null;
  enrollmentEnd: string | null;
  end: string | null;
  start: string | null;
  enrollmentMode: string | null;
  isEnrolled: boolean;
  license: string | null;
  userTimezone: string | null;
  showCalculator: boolean;
  notes: unknown;
  marketingUrl: string | null;
  celebrations: unknown;
  userHasPassingGrade: boolean;
  courseExitPageIsActive: boolean;
  certificateData: unknown;
  entranceExamData: unknown;
  language: string | null;
  timeOffsetMillis: number;
  verifyIdentityUrl: string | null;
  verificationStatus: string;
  linkedinAddToProfileUrl: string | null;
  relatedPrograms: unknown;
  userNeedsIntegritySignature: boolean;
  canAccessProctoredExams: boolean;
}

// Names only the fields `normalizeCoursewareMeta` reads; the endpoint returns more, left reachable as `unknown`.
// The whole http response: the Date header feeds the clock offset.
interface CoursewareMetadataResponse {
  data: {
    access_expiration: unknown;
    content_type_gating_enabled: boolean;
    course_goals: unknown;
    id: string;
    offer: unknown;
    enrollment_start: string | null;
    enrollment_end: string | null;
    end: string | null;
    start: string | null;
    enrollment: { mode: string | null; is_active: boolean };
    license: string | null;
    user_timezone: string | null;
    show_calculator: boolean;
    notes: unknown;
    marketing_url: string | null;
    celebrations: unknown;
    user_has_passing_grade: boolean;
    course_exit_page_is_active: boolean;
    certificate_data: unknown;
    entrance_exam_data: unknown;
    language: string | null;
    verify_identity_url: string | null;
    verification_status: string;
    linkedin_add_to_profile_url: string | null;
    related_programs: unknown;
    user_needs_integrity_signature: boolean;
    can_access_proctored_exams: boolean;
    [key: string]: unknown;
  };
  headers?: { date?: string };
}

export function normalizeCoursewareMeta(metadata: CoursewareMetadataResponse): CoursewareMeta {
  const requestTime = Date.now();
  const responseTime = requestTime;
  const { data, headers } = metadata;
  return {
    accessExpiration: camelCaseObject(data.access_expiration),
    contentTypeGatingEnabled: data.content_type_gating_enabled,
    courseGoals: camelCaseObject(data.course_goals),
    id: data.id,
    // `name` is no longer mapped to `title` here; see https://github.com/openedx/frontend-app-learning/issues/2137.
    offer: camelCaseObject(data.offer),
    enrollmentStart: data.enrollment_start,
    enrollmentEnd: data.enrollment_end,
    end: data.end,
    start: data.start,
    enrollmentMode: data.enrollment.mode,
    isEnrolled: data.enrollment.is_active,
    license: data.license,
    userTimezone: data.user_timezone,
    showCalculator: data.show_calculator,
    notes: camelCaseObject(data.notes),
    marketingUrl: data.marketing_url,
    celebrations: camelCaseObject(data.celebrations),
    userHasPassingGrade: data.user_has_passing_grade,
    courseExitPageIsActive: data.course_exit_page_is_active,
    certificateData: camelCaseObject(data.certificate_data),
    entranceExamData: camelCaseObject(data.entrance_exam_data),
    language: data.language,
    timeOffsetMillis: getTimeOffsetMillis(headers && headers.date, requestTime, responseTime),
    verifyIdentityUrl: data.verify_identity_url,
    verificationStatus: data.verification_status,
    linkedinAddToProfileUrl: data.linkedin_add_to_profile_url,
    relatedPrograms: camelCaseObject(data.related_programs),
    userNeedsIntegritySignature: data.user_needs_integrity_signature,
    canAccessProctoredExams: data.can_access_proctored_exams,
  };
}
