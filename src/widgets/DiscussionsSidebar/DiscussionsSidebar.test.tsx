import { act, screen } from '@testing-library/react';

import { discussionsSidebarRole } from '@src/constants';
import { addExternalRoute, addTestApp } from '@src/tests/slots';

import { discussionsSidebarWidgetId } from './constants';
import { renderAuxiliarySidebar, setupDiscussionTopics } from './testUtils';

describe('DiscussionsSidebar', () => {
  // The panel renders once it is the open sidebar: the stored preference opens it on render.
  const openDiscussions = (courseId: string) => {
    window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify(discussionsSidebarWidgetId));
  };

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('embeds the external route the site declares for the role, for the unit', async () => {
    addExternalRoute(discussionsSidebarRole, 'http://localhost:2002/discussions/sidebar/');
    const fixtures = await setupDiscussionTopics();
    openDiscussions(fixtures.courseId);
    renderAuxiliarySidebar(fixtures);

    expect(await screen.findByTitle('Discussions')).toHaveAttribute(
      'src',
      `http://localhost:2002/discussions/sidebar/${fixtures.courseId}/category/${fixtures.unitId}`,
    );
    expect(screen.getByTestId(`sidebar-${discussionsSidebarWidgetId}`)).toBeInTheDocument();
    // The trigger loads lazily too: wait for it, or it can finish loading after the test has ended.
    await screen.findByRole('button', { name: 'Show discussions tray' });
  });

  it('embeds the route of the installed app that provides the role, for the unit', async () => {
    addTestApp({ routes: [{ path: '/discussions/sidebar', handle: { roles: [discussionsSidebarRole] } }] });
    const fixtures = await setupDiscussionTopics();
    openDiscussions(fixtures.courseId);
    renderAuxiliarySidebar(fixtures);

    expect(await screen.findByTitle('Discussions')).toHaveAttribute(
      'src',
      `/discussions/sidebar/${fixtures.courseId}/category/${fixtures.unitId}`,
    );
  });

  it('shows nothing on a unit with no discussion topic', async () => {
    addExternalRoute(discussionsSidebarRole, 'http://localhost:2002/discussions/sidebar');
    const fixtures = await setupDiscussionTopics();
    openDiscussions(fixtures.courseId);
    renderAuxiliarySidebar({ ...fixtures, unitId: 'no-discussion' });
    await act(() => import('./DiscussionsSidebar'));

    expect(screen.queryByTitle('Discussions')).not.toBeInTheDocument();
  });

  it('shows nothing when nothing provides the discussions sidebar role, even when it is the stored sidebar', async () => {
    const fixtures = await setupDiscussionTopics();
    openDiscussions(fixtures.courseId);
    renderAuxiliarySidebar(fixtures);
    await act(() => import('./DiscussionsSidebar'));

    expect(screen.queryByTitle('Discussions')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Show discussions tray/i })).not.toBeInTheDocument();
  });
});
