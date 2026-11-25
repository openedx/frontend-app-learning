export const appId = 'org.openedx.frontend.app.learning';

export const learningRole = 'org.openedx.frontend.role.learning';
export const learningCourseRole = 'org.openedx.frontend.role.learningCourse';
export const courseOutlineRole = 'org.openedx.frontend.role.courseOutline';
export const courseDatesRole = 'org.openedx.frontend.role.courseDates';
export const courseProgressRole = 'org.openedx.frontend.role.courseProgress';
export const coursewareRole = 'org.openedx.frontend.role.courseware';

export const dashboardRole = 'org.openedx.frontend.role.dashboard';
export const profileRole = 'org.openedx.frontend.role.profile';
export const discussionsRole = 'org.openedx.frontend.role.discussions';
export const accountRole = 'org.openedx.frontend.role.account';
export const coursesRole = 'org.openedx.frontend.role.courses';
// The chromeless Discussions route the auxiliary sidebar embeds, with `/<course id>/category/<unit id>` appended.
// Both the role name and that sub-path are local proposals: openedx/frontend-app-discussions#802 has not fixed
// either yet.
export const discussionsSidebarRole = 'org.openedx.frontend.role.discussionsSidebar';

export const WIDGETS = {
  COURSE_OUTLINE: 'COURSE_OUTLINE',
} as const satisfies Readonly<Record<string, string>>;

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const FAILED = 'failed';
