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
import { fireEvent, initializeMockApp, waitFor } from '../../setupTest';
import initializeStore from '../../store';
import { TabContainer } from '../../tab-page';
import { appendBrowserTimezoneToUrl } from '../../utils';
import { UserMessagesProvider } from '../../generic/user-messages';

initializeMockApp();

describe('DatesTab', () => {
  let axiosMock;

  const store = initializeStore();
  const component = (
    <AppProvider store={store}>
      <UserMessagesProvider>
        <Route path="/course/:courseId/dates">
          <TabContainer tab="dates" fetch={fetchDatesTab} slice="courseHome">
            <DatesTab />
          </TabContainer>
        </Route>
      </UserMessagesProvider>
    </AppProvider>
  );

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
      const courseMetadata = Factory.build('courseHomeMetadata');
      const { courseId } = courseMetadata;
      let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/${courseId}`;
      courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/course_home/v1/dates/${courseId}`).reply(200, datesTabData);
      history.push(`/course/${courseId}/dates`); // so tab can pull course id from url

      render(component);
    });

    it('handles unreleased & complete', async () => {
      const { header } = await getDay('Sun, May 3, 2020');
      const badges = within(header).getAllByTestId('dates-badge');
      expect(badges).toHaveLength(2);
      expect(badges[0]).toHaveTextContent('Completed');
      expect(badges[1]).toHaveTextContent('Not yet released');
    });

    it('handles unreleased & past due', async () => {
      const { header } = await getDay('Mon, May 4, 2020');
      const badges = within(header).getAllByTestId('dates-badge');
      expect(badges).toHaveLength(2);
      expect(badges[0]).toHaveTextContent('Past due');
      expect(badges[1]).toHaveTextContent('Not yet released');
    });

    it('handles verified only', async () => {
      const { day } = await getDay('Sun, Aug 18, 2030');
      const badge = within(day).getByTestId('dates-badge');
      expect(badge).toHaveTextContent('Verified only');
    });

    it('verified only has no link', async () => {
      const { day } = await getDay('Sun, Aug 18, 2030');
      expect(within(day).queryByRole('link')).toBeNull();
    });

    it('same status items have header badge', async () => {
      const { day, header } = await getDay('Tue, May 26, 2020');
      const badge = within(header).getByTestId('dates-badge');
      expect(badge).toHaveTextContent('Past due'); // one header badge
      expect(within(day).getAllByTestId('dates-badge')).toHaveLength(1); // no other badges
    });

    it('different status items have individual badges', async () => {
      const { header, items } = await getDay('Thu, May 28, 2020');
      const headerBadges = within(header).queryAllByTestId('dates-badge');
      expect(headerBadges).toHaveLength(0); // no header badges
      expect(items).toHaveLength(2);
      expect(within(items[0]).getByTestId('dates-badge')).toHaveTextContent('Completed');
      expect(within(items[1]).getByTestId('dates-badge')).toHaveTextContent('Past due');
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

  describe('Dates banner container ', () => {
    const courseMetadata = Factory.build('courseHomeMetadata', { is_self_paced: true, is_enrolled: true });
    const { courseId } = courseMetadata;
    const datesTabData = Factory.build('datesTabData');

    let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/course_home/v1/course_metadata/${courseId}`;
    courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

    beforeEach(() => {
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
      history.push(`/course/${courseId}/dates`);
    });

    it('renders datesTabInfoBanner', async () => {
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: false,
        missedDeadlines: false,
        missedGatedContent: false,
      };

      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/course_home/v1/dates/${courseId}`).reply(200, datesTabData);
      render(component);

      await waitFor(() => expect(screen.getByText("We've built a suggested schedule to help you stay on track.")).toBeInTheDocument());
    });

    it('renders upgradeToCompleteGradedBanner', async () => {
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: true,
        missedDeadlines: false,
        missedGatedContent: false,
        verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      };

      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/course_home/v1/dates/${courseId}`).reply(200, datesTabData);
      render(component);

      await waitFor(() => expect(screen.getByText('You are auditing this course,')).toBeInTheDocument());
      expect(screen.getByText('which means that you are unable to participate in graded assignments. To complete graded assignments as part of this course, you can upgrade today.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Upgrade now' })).toBeInTheDocument();
    });

    it('renders upgradeToResetBanner', async () => {
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: true,
        missedDeadlines: true,
        missedGatedContent: true,
        verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      };

      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/course_home/v1/dates/${courseId}`).reply(200, datesTabData);
      render(component);

      await waitFor(() => expect(screen.getByText('You are auditing this course,')).toBeInTheDocument());
      expect(screen.getByText('which means that you are unable to participate in graded assignments. It looks like you missed some important deadlines based on our suggested schedule. To complete graded assignments as part of this course and shift the past due assignments into the future, you can upgrade today.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Upgrade to shift due dates' })).toBeInTheDocument();
    });

    it('renders resetDatesBanner', async () => {
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: true,
        missedDeadlines: true,
        missedGatedContent: false,
        verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      };

      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/course_home/v1/dates/${courseId}`).reply(200, datesTabData);
      render(component);

      await waitFor(() => expect(screen.getByText('It looks like you missed some important deadlines based on our suggested schedule.')).toBeInTheDocument());
      expect(screen.getByText('To keep yourself on track, you can update this schedule and shift the past due assignments into the future. Don’t worry—you won’t lose any of the progress you’ve made when you shift your due dates.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Shift due dates' })).toBeInTheDocument();
    });

    it('handles shift due dates click', async () => {
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: true,
        missedDeadlines: true,
        missedGatedContent: false,
        verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      };

      axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/course_home/v1/dates/${courseId}`).reply(200, datesTabData);
      render(component);

      // confirm "Shift due dates" button has rendered
      await waitFor(() => expect(screen.getByRole('button', { name: 'Shift due dates' })).toBeInTheDocument());

      // update response to reflect shifted dates
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: true,
        missedDeadlines: false,
        missedGatedContent: false,
        verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      };

      const resetDeadlinesData = {
        header: "You've successfully shifted your dates!",
      };
      axiosMock.onPost(`${getConfig().LMS_BASE_URL}/api/course_experience/v1/reset_course_deadlines`).reply(200, resetDeadlinesData);

      // click "Shift due dates"
      fireEvent.click(screen.getByRole('button', { name: 'Shift due dates' }));

      // wait for page to reload & Toast to render
      await waitFor(() => expect(screen.getByText("You've successfully shifted your dates!")).toBeInTheDocument());
      // confirm "Shift due dates" button has not rendered
      expect(screen.queryByRole('button', { name: 'Shift due dates' })).not.toBeInTheDocument();
    });
  });
});
