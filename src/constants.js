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
  ],
  REDIRECT_HOME: 'home/:courseId',
  REDIRECT_SURVEY: 'survey/:courseId',
};

export const ROUTES = {
  UNSUBSCRIBE: '/goal-unsubscribe/:token',
  REDIRECT: '/redirect/*',
  DASHBOARD: 'dashboard',
  CONSENT: 'consent',
};

export const REDIRECT_MODES = {
  DASHBOARD_REDIRECT: 'dashboard-redirect',
  CONSENT_REDIRECT: 'consent-redirect',
  HOME_REDIRECT: 'home-redirect',
  SURVEY_REDIRECT: 'survey-redirect',
};
