import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { discussionsSidebarRole } from '@src/constants';
import { addExternalRoute } from '@src/tests/slots';

import { discussionsSidebarWidgetId } from './constants';
import { renderAuxiliarySidebar, setupDiscussionTopics } from './testUtils';

const triggerName = /Show discussions tray/i;

describe('DiscussionsTrigger', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe('with the discussions sidebar role resolved', () => {
    beforeEach(() => {
      addExternalRoute(discussionsSidebarRole, 'http://localhost:2002/discussions/sidebar');
    });

    it('shows up on a unit with discussions enabled, and opens the discussions panel', async () => {
      const user = userEvent.setup();
      renderAuxiliarySidebar(await setupDiscussionTopics());

      await user.click(await screen.findByRole('button', { name: triggerName }));

      expect(screen.getByTestId('current-sidebar')).toHaveTextContent(discussionsSidebarWidgetId);
      // The panel it opens loads lazily: wait for it, or it can finish loading after the test has ended.
      expect(await screen.findByTitle('Discussions')).toBeInTheDocument();
    });

    it("doesn't show up on a unit with no discussion topic", async () => {
      const fixtures = await setupDiscussionTopics();
      renderAuxiliarySidebar({ ...fixtures, unitId: 'has-no-discussion' });

      expect(screen.queryByRole('button', { name: triggerName })).not.toBeInTheDocument();
    });

    it("doesn't show up on a unit whose topic is not enabled in context", async () => {
      renderAuxiliarySidebar(await setupDiscussionTopics({ enabledInContext: false }));

      expect(screen.queryByRole('button', { name: triggerName })).not.toBeInTheDocument();
    });

    it('reads the topics without requesting them', async () => {
      const fixtures = await setupDiscussionTopics();
      const requestsBefore = fixtures.axiosMock.history.get.length;
      renderAuxiliarySidebar(fixtures);

      expect(await screen.findByRole('button', { name: triggerName })).toBeInTheDocument();
      expect(fixtures.axiosMock.history.get).toHaveLength(requestsBefore);
    });
  });

  it("doesn't show up when nothing provides the discussions sidebar role", async () => {
    renderAuxiliarySidebar(await setupDiscussionTopics());

    expect(screen.queryByRole('button', { name: triggerName })).not.toBeInTheDocument();
  });
});
