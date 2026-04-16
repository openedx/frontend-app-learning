export const DECODE_ROUTES = {
  ACCESS_DENIED: '/course/:courseId/access-denied',
  HOME: '/course/:courseId/home',
  LIVE: '/course/:courseId/live',
  DATES: '/course/:courseId/dates',
  DISCUSSION: '/course/:courseId/discussion/:path/*',
  PROGRESS: [
    '/course/:courseId/progress/:targetUserId/',
    '/course/:courseId/progress',
  ],
  COURSE_END: '/course/:courseId/course-end',
  COURSEWARE: [
    '/course/:courseId/:sequenceId/:unitId',
    '/course/:courseId/:sequenceId',
    '/course/:courseId',
    '/preview/course/:courseId/:sequenceId/:unitId',
    '/preview/course/:courseId/:sequenceId',
  ],
  REDIRECT_HOME: 'home/:courseId',
  REDIRECT_SURVEY: 'survey/:courseId',
} as const satisfies Readonly<{ [k: string]: string | readonly string[] }>;

export const ROUTES = {
  UNSUBSCRIBE: '/goal-unsubscribe/:token',
  PREFERENCES_UNSUBSCRIBE: '/preferences-unsubscribe/:userToken/:updatePatch?',
  REDIRECT: '/redirect/*',
  DASHBOARD: 'dashboard',
  ENTERPRISE_LEARNER_DASHBOARD: 'enterprise-learner-dashboard',
  CONSENT: 'consent',
} as const satisfies Readonly<{ [k: string]: string }>;

export const REDIRECT_MODES = {
  DASHBOARD_REDIRECT: 'dashboard-redirect',
  ENTERPRISE_LEARNER_DASHBOARD_REDIRECT: 'enterprise-learner-dashboard-redirect',
  CONSENT_REDIRECT: 'consent-redirect',
  HOME_REDIRECT: 'home-redirect',
  SURVEY_REDIRECT: 'survey-redirect',
} as const satisfies Readonly<{ [k: string]: string }>;

export const VERIFIED_MODES = [
  'professional',
  'verified',
  'no-id-professional',
  'credit',
  'masters',
  'executive-education',
  'paid-executive-education',
  'paid-bootcamp',
] as const satisfies readonly string[];

export const AUDIT_MODES = [
  'audit',
  'honor',
  'unpaid-executive-education',
  'unpaid-bootcamp',
] as const satisfies readonly string[];

// In sync with CourseMode.UPSELL_TO_VERIFIED_MODES
// https://github.com/openedx/edx-platform/blob/master/common/djangoapps/course_modes/models.py#L231
export const ALLOW_UPSELL_MODES = [
  'audit',
  'honor',
] as const satisfies readonly string[];

export const WIDGETS = {
  DISCUSSIONS: 'DISCUSSIONS',
  NOTIFICATIONS: 'NOTIFICATIONS',
} as const satisfies Readonly<{ [k: string]: string }>;

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const FAILED = 'failed';
export const DENIED = 'denied';
export type StatusValue = typeof LOADING | typeof LOADED | typeof FAILED | typeof DENIED;
