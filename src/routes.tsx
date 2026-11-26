import { PageWrap, RoleRouteObject } from '@openedx/frontend-base';
import { Outlet } from 'react-router-dom';

import {
  courseDatesRole,
  courseOutlineRole,
  courseProgressRole,
  coursewareRole,
  learningCourseRole,
  learningRole,
} from './constants';
import discussionRedirectLoader from './course-home/discussion-tab/discussionRedirectLoader';
import {
  consentLoader, dashboardLoader, enterpriseLearnerDashboardLoader, homeLoader, surveyLoader,
} from './courseware/redirectLoaders';
import DecodePageRoute from './decode-page-route';
import PathFixesProvider from './generic/path-fixes';

const outlineRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.outline',
    path: 'home',
    handle: { roles: [courseOutlineRole] },
    async lazy() {
      const module = await import(/* webpackChunkName: "learning-outline" */ './pages/OutlinePage');
      return { Component: module.default };
    },
  },
];

const datesRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.dates',
    path: 'dates',
    handle: { roles: [courseDatesRole] },
    async lazy() {
      const module = await import(/* webpackChunkName: "learning-dates" */ './pages/DatesPage');
      return { Component: module.default };
    },
  },
];

const lazyProgressTab = async () => {
  const module = await import(/* webpackChunkName: "learning-progress" */ './pages/ProgressPage');
  return { Component: module.default };
};

const progressRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.progress',
    path: 'progress',
    handle: { roles: [courseProgressRole] },
    lazy: lazyProgressTab,
  },
  {
    path: 'progress/:targetUserId',
    handle: { roles: [courseProgressRole] },
    lazy: lazyProgressTab,
  },
];

const discussionRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.discussion',
    path: 'discussion/:path/*',
    element: null,
    loader: discussionRedirectLoader,
  },
];

const liveRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.live',
    path: 'live',
    async lazy() {
      const module = await import(/* webpackChunkName: "learning-live" */ './pages/LivePage');
      return { Component: module.default };
    },
  },
];

const lazyCourseware = async () => {
  const module = await import(/* webpackChunkName: "learning-courseware" */ './pages/CoursewarePage');
  return { Component: module.default };
};

// The preview routes' page tells the courseware it is previewing.
const lazyPreviewCourseware = async () => {
  const module = await import(/* webpackChunkName: "learning-courseware" */ './pages/CoursewarePage');
  return { Component: module.PreviewCoursewarePage };
};

const coursewareRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.courseware',
    index: true,
    handle: { roles: [coursewareRole] },
    lazy: lazyCourseware,
  },
  {
    path: ':sequenceId',
    handle: { roles: [coursewareRole] },
    lazy: lazyCourseware,
  },
  {
    path: ':sequenceId/:unitId',
    handle: { roles: [coursewareRole] },
    lazy: lazyCourseware,
  },
];

const previewCoursewareRoutes: RoleRouteObject[] = [
  {
    index: true,
    element: null,
    loader: () => {
      throw new Response(null, { status: 404 });
    },
  },
  {
    path: ':sequenceId',
    handle: { roles: [coursewareRole] },
    lazy: lazyPreviewCourseware,
  },
  {
    path: ':sequenceId/:unitId',
    handle: { roles: [coursewareRole] },
    lazy: lazyPreviewCourseware,
  },
];

const courseExitRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.courseExit',
    path: 'course-end',
    async lazy() {
      const module = await import(/* webpackChunkName: "learning-course-exit" */ './pages/CourseExitPage');
      return { Component: module.default };
    },
  },
];

const accessDeniedRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.accessDenied',
    path: 'access-denied',
    async lazy() {
      const module = await import(/* webpackChunkName: "learning-access-denied" */ './pages/AccessDeniedPage');
      return { Component: module.default };
    },
  },
];

const courseRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.course',
    path: 'course/:courseId',
    handle: { roles: [learningCourseRole] },
    element: <DecodePageRoute><Outlet /></DecodePageRoute>,
    children: [
      ...outlineRoutes,
      ...datesRoutes,
      ...progressRoutes,
      ...discussionRoutes,
      ...liveRoutes,
      ...coursewareRoutes,
      ...courseExitRoutes,
      ...accessDeniedRoutes,
    ],
  },
  {
    id: 'org.openedx.frontend.route.learning.preview',
    path: 'preview/course/:courseId',
    handle: { roles: [learningCourseRole] },
    element: <DecodePageRoute><Outlet /></DecodePageRoute>,
    children: previewCoursewareRoutes,
  },
];

const goalUnsubscribeRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.goalUnsubscribe',
    path: 'goal-unsubscribe/:token',
    async lazy() {
      const { default: GoalUnsubscribe } = await import(/* webpackChunkName: "learning-goal-unsubscribe" */ './course-home/goal-unsubscribe');
      return { element: <PageWrap><GoalUnsubscribe /></PageWrap> };
    },
  },
];

const redirectRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.redirect',
    path: 'redirect',
    children: [
      { path: 'dashboard', loader: dashboardLoader },
      { path: 'enterprise-learner-dashboard', loader: enterpriseLearnerDashboardLoader },
      { path: 'survey/:courseId', loader: surveyLoader },
      { path: 'consent', loader: consentLoader },
      { path: 'home/:courseId', loader: homeLoader },
    ],
  },
];

const preferencesUnsubscribeRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.preferencesUnsubscribe',
    path: 'preferences-unsubscribe/:userToken/:updatePatch?',
    async lazy() {
      const { default: PreferencesUnsubscribe } = await import(/* webpackChunkName: "learning-preferences-unsubscribe" */ './preferences-unsubscribe');
      return { element: <PageWrap><PreferencesUnsubscribe /></PageWrap> };
    },
  },
];

const routes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.main',
    path: 'learning',
    handle: { roles: [learningRole] },
    async lazy() {
      const module = await import(/* webpackChunkName: "learning-main" */ './Main');
      return { Component: module.default };
    },
    children: [
      {
        id: 'org.openedx.frontend.route.learning.pathFixes',
        element: <PathFixesProvider><Outlet /></PathFixesProvider>,
        children: [
          ...courseRoutes,
          ...goalUnsubscribeRoutes,
          ...redirectRoutes,
          ...preferencesUnsubscribeRoutes,
        ],
      },
      // Learning has no page of its own at its root: the shell shows its not-found page, as it does for any path
      // Learning does not have.
      {
        index: true,
        element: null,
        loader: () => {
          throw new Response(null, { status: 404 });
        },
      },
    ],
  },
];

export default routes;
