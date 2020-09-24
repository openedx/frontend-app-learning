import React from 'react';
import { Route } from 'react-router';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';
import { getConfig, history } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { waitForElementToBeRemoved } from '@testing-library/dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DatesTab from './DatesTab';
import { fetchDatesTab } from '../data';
import { initializeMockApp } from '../../setupTest';
import initializeStore from '../../store';
import { TabContainer } from '../../tab-page';
import { UserMessagesProvider } from '../../generic/user-messages';

initializeMockApp();

describe('DatesTab', () => {
  let axiosMock;

  const store = initializeStore();
  const component = (
    <AppProvider store={store}>
      <UserMessagesProvider>
        <Route path="/course/:courseId/dates">
          <TabContainer tab="dates" fetch={fetchDatesTab}>
            <DatesTab />
          </TabContainer>
        </Route>
      </UserMessagesProvider>
    </AppProvider>
  );
  const courseMetadata = Factory.build('courseHomeMetadata');
  const { courseId } = courseMetadata;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/${courseId}`).reply(200, courseMetadata);
    history.push(`/course/${courseId}/dates`); // so tab can pull course id from url
  });

  // The dates tab is largely repetitive non-interactive static data. Thus it's a little tough to follow
  // testing-library's advice around testing the way your user uses the site (i.e. can't find form elements by label or
  // anything). Instead, we find elements by printed date (which is what the user sees) and data-testid. Which is
  // better than assuming anything about how the surrounding elements are organized by div and span or whatever. And
  // better than adding non-style class names.
  // Hence the following getDay query helper.
  async function getDay(date) {
    const dateNode = await screen.findByText(date);
    let parent = dateNode.parentElement;
    while (parent) {
      if (parent.dataset && parent.dataset.testid === 'dates-day') {
        return {
          day: parent,
          header: within(parent).getByTestId('dates-header'),
          items: within(parent).queryAllByTestId('dates-item'),
        };
      }
      parent = parent.parentElement;
    }
    throw new Error('Did not find day container');
  }

  describe('when receiving a full set of dates data', () => {
    beforeEach(() => {
      const datesTabData = Factory.build('datesTabData');
      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/course_home/v1/dates/${courseId}`).reply(200, datesTabData);
      render(component);
    });

    it('handles unreleased & complete', async () => {
      const { header } = await getDay('Sun, May 3, 2020');
      const badges = within(header).getAllByTestId('dates-badge');
      expect(badges).toHaveLength(2);
      expect(badges[0]).toHaveTextContent('Completed');
      expect(badges[1]).toHaveTextContent('Not Yet Released');
    });

    it('handles unreleased & past due', async () => {
      const { header } = await getDay('Mon, May 4, 2020');
      const badges = within(header).getAllByTestId('dates-badge');
      expect(badges).toHaveLength(2);
      expect(badges[0]).toHaveTextContent('Past Due');
      expect(badges[1]).toHaveTextContent('Not Yet Released');
    });

    it('handles verified only', async () => {
      const { day } = await getDay('Sun, Aug 18, 2030');
      const badge = within(day).getByTestId('dates-badge');
      expect(badge).toHaveTextContent('Verified Only');
    });

    it('verified only has no link', async () => {
      const { day } = await getDay('Sun, Aug 18, 2030');
      expect(within(day).queryByRole('link')).toBeNull();
    });

    it('same status items have header badge', async () => {
      const { day, header } = await getDay('Tue, May 26, 2020');
      const badge = within(header).getByTestId('dates-badge');
      expect(badge).toHaveTextContent('Past Due'); // one header badge
      expect(within(day).getAllByTestId('dates-badge')).toHaveLength(1); // no other badges
    });

    it('different status items have individual badges', async () => {
      const { header, items } = await getDay('Thu, May 28, 2020');
      const headerBadges = within(header).queryAllByTestId('dates-badge');
      expect(headerBadges).toHaveLength(0); // no header badges
      expect(items).toHaveLength(2);
      expect(within(items[0]).getByTestId('dates-badge')).toHaveTextContent('Completed');
      expect(within(items[1]).getByTestId('dates-badge')).toHaveTextContent('Past Due');
    });

    it('shows extra info', async () => {
      const { items } = await getDay('Sat, Aug 17, 2030');
      expect(items).toHaveLength(3);

      const tipIcon = within(items[2]).getByTestId('dates-extra-info');
      const tipText = "ORA Dates are set by the instructor, and can't be changed";

      expect(screen.queryByText(tipText)).toBeNull(); // tooltip does not start in DOM
      userEvent.hover(tipIcon);
      const tooltip = screen.getByText(tipText); // now it's there
      userEvent.unhover(tipIcon);
      waitForElementToBeRemoved(tooltip); // and it's gone again
    });
  });
});
