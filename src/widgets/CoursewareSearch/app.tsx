import { App, WidgetOperationTypes } from '@openedx/frontend-base';
import { lazy, Suspense } from 'react';

import { learningCourseRole } from '@src/constants';

export const coursewareSearchWidgetId = 'org.openedx.frontend.widget.learning.coursewareSearch.v1';

// The course bar renders outside Learning's lazily loaded routes, so the search code (and joi, which it validates
// responses with) would otherwise land in the site's main bundle: it loads on first render instead.
const CoursewareSearchWidget = lazy(() => import(/* webpackChunkName: "learning-courseware-search" */ './CoursewareSearchWidget'));

export const LazyCoursewareSearchWidget = () => (
  <Suspense fallback={null}>
    <CoursewareSearchWidget />
  </Suspense>
);

const app: App = {
  appId: 'org.openedx.frontend.app.learning.coursewareSearch',
  slots: [
    {
      slotId: 'org.openedx.frontend.slot.header.courseNavigationBar.extraContent.v1',
      id: coursewareSearchWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: LazyCoursewareSearchWidget,
      condition: { active: [learningCourseRole] },
    },
  ],
};

export default app;
