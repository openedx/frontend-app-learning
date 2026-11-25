import {
  getSiteConfig, helpWidgetId, mergeAppConfig, mergeSiteConfig, setSiteConfig, type SlotOperation, WidgetOperationTypes,
} from '@openedx/frontend-base';
import { screen } from '@testing-library/react';
import { type ReactElement } from 'react';

import {
  appId, dashboardRole, learningCourseRole, learningRole,
} from '@src/constants';
import { render } from '@src/tests/render';

import CourseInfo from './CourseInfo';
import learningHeaderApp, { courseInfoWidgetId, dashboardLinkWidgetId } from './app';

const siteConfig = getSiteConfig();

const operation = (id: string) => (learningHeaderApp.slots ?? []).find(
  (op: SlotOperation) => 'id' in op && op.id === id,
);
const elementOf = (id: string) => (operation(id) as { element: ReactElement }).element;

afterEach(() => {
  setSiteConfig(siteConfig);
  mergeAppConfig(appId, { SUPPORT_URL: null });
});

describe('learningHeaderApp', () => {
  it('appends the course info widget to the primary links on Learning course routes', () => {
    expect(operation(courseInfoWidgetId)).toEqual({
      slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
      id: courseInfoWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: CourseInfo,
      condition: { active: [learningCourseRole] },
    });
  });

  it('adds the help button on Learning routes', () => {
    expect(operation(helpWidgetId)).toMatchObject({
      slotId: 'org.openedx.frontend.slot.header.secondaryLinks.v1',
      condition: { active: [learningRole] },
    });
  });

  // Paragon's NavLink, which the help button renders, warns about its own defaultProps: the URL is checked on the element.
  it('links the help button to SUPPORT_URL from Learning app config', () => {
    mergeAppConfig(appId, { SUPPORT_URL: 'http://localhost/support' });

    expect(elementOf(helpWidgetId).props.getUrl()).toBe('http://localhost/support');
  });

  it('inserts the dashboard item before logout in the user menu on Learning routes', () => {
    expect(operation(dashboardLinkWidgetId)).toMatchObject({
      slotId: 'org.openedx.frontend.slot.header.authenticatedMenu.v1',
      op: WidgetOperationTypes.INSERT_BEFORE,
      relatedId: 'org.openedx.frontend.widget.header.desktopAuthenticatedMenuLogout.v1',
      condition: { active: [learningRole] },
    });
  });

  it('links the dashboard item to the dashboard role', () => {
    mergeSiteConfig({ externalRoutes: [{ role: dashboardRole, url: 'http://localhost:18000/dashboard' }] });
    render(elementOf(dashboardLinkWidgetId), { wrapWithRouter: true });

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', 'http://localhost:18000/dashboard');
  });
});
