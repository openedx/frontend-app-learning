import { RoleRouteObject } from '@openedx/frontend-base';
import { Outlet } from 'react-router-dom';

import {
  courseDatesRole,
  courseOutlineRole,
  courseProgressRole,
  coursewareRole,
  learningCourseRole,
  learningRole,
} from './constants';
import StubPage from './StubPage';

const outlineRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.outline',
    path: 'home',
    handle: { roles: [courseOutlineRole] },
    element: <StubPage page="outline" />,
  },
];

const datesRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.dates',
    path: 'dates',
    handle: { roles: [courseDatesRole] },
    async lazy() {
      const module = await import(/* webpackChunkName: "learning-dates" */ './course-home/dates-tab');
      return { Component: module.default };
    },
  },
];

const progressRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.progress',
    path: 'progress',
    handle: { roles: [courseProgressRole] },
    element: <StubPage page="progress" />,
  },
  {
    path: 'progress/:targetUserId',
    handle: { roles: [courseProgressRole] },
    element: <StubPage page="progress" />,
  },
];

const discussionRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.discussion',
    path: 'discussion/:path/*',
    element: <StubPage page="discussion" />,
  },
];

const liveRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.live',
    path: 'live',
    element: <StubPage page="live" />,
  },
];

const coursewareRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.courseware',
    index: true,
    handle: { roles: [coursewareRole] },
    element: <StubPage page="courseware" />,
  },
  {
    path: ':sequenceId',
    handle: { roles: [coursewareRole] },
    element: <StubPage page="courseware" />,
  },
  {
    path: ':sequenceId/:unitId',
    handle: { roles: [coursewareRole] },
    element: <StubPage page="courseware" />,
  },
];

const previewCoursewareRoutes: RoleRouteObject[] = [
  {
    path: ':sequenceId',
    handle: { roles: [coursewareRole] },
    element: <StubPage page="courseware" />,
  },
  {
    path: ':sequenceId/:unitId',
    handle: { roles: [coursewareRole] },
    element: <StubPage page="courseware" />,
  },
];

const courseExitRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.courseExit',
    path: 'course-end',
    element: <StubPage page="courseExit" />,
  },
];

const accessDeniedRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.accessDenied',
    path: 'access-denied',
    element: <StubPage page="accessDenied" />,
  },
];

const courseRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.course',
    path: 'course/:courseId',
    handle: { roles: [learningCourseRole] },
    element: <Outlet />,
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
    element: <Outlet />,
    children: previewCoursewareRoutes,
  },
];

const goalUnsubscribeRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.goalUnsubscribe',
    path: 'goal-unsubscribe/:token',
    element: <StubPage page="goalUnsubscribe" />,
  },
];

const redirectRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.redirect',
    path: 'redirect/*',
    element: <StubPage page="redirect" />,
  },
];

const preferencesUnsubscribeRoutes: RoleRouteObject[] = [
  {
    id: 'org.openedx.frontend.route.learning.preferencesUnsubscribe',
    path: 'preferences-unsubscribe/:userToken/:updatePatch?',
    element: <StubPage page="preferencesUnsubscribe" />,
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
      ...courseRoutes,
      ...goalUnsubscribeRoutes,
      ...redirectRoutes,
      ...preferencesUnsubscribeRoutes,
    ],
  },
];

export default routes;
