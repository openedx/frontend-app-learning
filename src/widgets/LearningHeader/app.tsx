import {
  App, LinkMenuItem, WidgetOperationTypes, helpButtonSlotOperation,
} from '@openedx/frontend-base';

import {
  appId, dashboardRole, learningCourseRole, learningRole,
} from '@src/constants';

import CourseInfo from './CourseInfo';
import messages from './messages';

export const courseInfoWidgetId = 'org.openedx.frontend.widget.learning.courseInfo.v1';
export const dashboardLinkWidgetId = 'org.openedx.frontend.widget.learning.headerLinkDashboard.v1';

const app: App = {
  appId: 'org.openedx.frontend.app.learning.header',
  slots: [
    {
      slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
      id: courseInfoWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: CourseInfo,
      // The query cache can still hold a Learning course after the learner moves to another app's course page.
      condition: { active: [learningCourseRole] },
    },
    helpButtonSlotOperation({ appId, role: learningRole }),
    {
      slotId: 'org.openedx.frontend.slot.header.authenticatedMenu.v1',
      id: dashboardLinkWidgetId,
      op: WidgetOperationTypes.INSERT_BEFORE,
      relatedId: 'org.openedx.frontend.widget.header.desktopAuthenticatedMenuLogout.v1',
      element: <LinkMenuItem label={messages.dashboard} role={dashboardRole} variant="dropdownItem" />,
      condition: { active: [learningRole] },
    },
  ],
};

export default app;
