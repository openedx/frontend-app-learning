import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';
import {
  getAnalyticsService, getAuthenticatedHttpClient, getSiteConfig, runPageRules,
} from '@openedx/frontend-base';
import {
  fireEvent, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import routes from '@src/routes';
import { mockLocation } from '@src/tests/location';
import { renderRoutes } from '@src/tests/render';
import { appendBrowserTimezoneToUrl } from '../../utils';
import suggestedScheduleMessages from '../suggested-schedule-messaging/messages';
import messages from './messages';

describe('DatesTab', () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  const datesTabData = Factory.build('datesTabData');
  let courseMetadata = Factory.build('courseHomeMetadata', { user_timezone: 'America/New_York' });
  const { id: courseId } = courseMetadata;

  const datesUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/dates/${courseId}`;
  let courseMetadataUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

  const datesPath = `/learning/course/${courseId}/dates`;
  const renderDates = () => renderRoutes(routes, datesPath);

  function setMetadata(attributes, options) {
    courseMetadata = Factory.build('courseHomeMetadata', attributes, options);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
  }

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
      axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
      axiosMock.onGet(datesUrl).reply(200, datesTabData);
      renderDates();
    });

    it('reports no page-rule diagnostics', async () => {
      await screen.findByRole('heading', { name: messages.title.defaultMessage });
      expect(runPageRules(document)).toEqual([]);
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
      const user = userEvent.setup();
      const { items } = await getDay('Sat, Aug 17, 2030');
      expect(items).toHaveLength(3);

      const tipIcon = within(items[2]).getByTestId('dates-extra-info');
      const tipText = "ORA Dates are set by the instructor, and can't be changed";

      expect(screen.queryByText(tipText)).toBeNull(); // tooltip does not start in DOM
      await user.hover(tipIcon);
      screen.getByText(tipText); // now it's there
      await user.unhover(tipIcon);
      await waitFor(() => {
        expect(screen.queryByText(tipText)).toBeNull(); // and it's gone again
      });
    });
  });

  describe('Suggested schedule messaging', () => {
    beforeEach(() => {
      setMetadata({ is_self_paced: true, is_enrolled: true });
    });

    it('renders SuggestedScheduleHeader', async () => {
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: false,
        missedDeadlines: false,
        missedGatedContent: false,
      };

      axiosMock.onGet(datesUrl).reply(200, datesTabData);
      renderDates();

      await waitFor(() => expect(screen.getByText('We’ve built a suggested schedule to help you stay on track. But don’t worry—it’s flexible so you can learn at your own pace.')).toBeInTheDocument());
    });

    it('does not render UpgradeToCompleteAlert when contentTypeGatingEnabled is false', async () => {
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: false,
        missedDeadlines: false,
        missedGatedContent: false,
        verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      };

      axiosMock.onGet(datesUrl).reply(200, datesTabData);
      renderDates();

      await screen.findByText(suggestedScheduleMessages.suggestedSchedule.defaultMessage);
      expect(screen.queryByText('You are auditing this course, which means that you are unable to participate in graded assignments. To complete graded assignments as part of this course, you can upgrade today.')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Upgrade now' })).not.toBeInTheDocument();
    });

    it('renders UpgradeToShiftDatesAlert', async () => {
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: true,
        missedDeadlines: true,
        missedGatedContent: true,
        verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      };

      axiosMock.onGet(datesUrl).reply(200, datesTabData);
      renderDates();

      await waitFor(() => expect(screen.getByText('It looks like you missed some important deadlines based on our suggested schedule.')).toBeInTheDocument());
      expect(screen.getByText('To keep yourself on track, you can update this schedule and shift the past due assignments into the future. Don’t worry—you won’t lose any of the progress you’ve made when you shift your due dates.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Upgrade to shift due dates' })).toBeInTheDocument();
    });

    it('renders ShiftDatesAlert', async () => {
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: true,
        missedDeadlines: true,
        missedGatedContent: false,
        verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      };

      axiosMock.onGet(datesUrl).reply(200, datesTabData);
      renderDates();

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

      axiosMock.onGet(datesUrl).reply(200, datesTabData);
      renderDates();

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
      axiosMock.onPost(`${getSiteConfig().lmsBaseUrl}/api/course_experience/v1/reset_course_deadlines`).reply(200, resetDeadlinesData);

      // click "Shift due dates"
      fireEvent.click(screen.getByRole('button', { name: 'Shift due dates' }));

      // wait for page to reload & Toast to render
      await waitFor(() => expect(screen.getByText("You've successfully shifted your dates!")).toBeInTheDocument());
      // confirm "Shift due dates" button has not rendered
      expect(screen.queryByRole('button', { name: 'Shift due dates' })).not.toBeInTheDocument();
    });

    it('sends analytics event onClick of upgrade button in UpgradeToCompleteAlert', async () => {
      mockLocation({ replace: jest.fn() });
      getAnalyticsService().sendTrackEvent.mockClear();
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: true,
        missedDeadlines: false,
        missedGatedContent: false,
        verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      };

      axiosMock.onGet(datesUrl).reply(200, datesTabData);
      renderDates();

      const upgradeButton = await waitFor(() => screen.getByRole('button', { name: 'Upgrade now' }));
      fireEvent.click(upgradeButton);

      expect(getAnalyticsService().sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(getAnalyticsService().sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.upsell_links_clicked', {
        org_key: 'edX',
        courserun_key: courseId,
        linkCategory: 'personalized_learner_schedules',
        linkName: 'dates_upgrade',
        linkType: 'button',
        pageName: 'dates_tab',
      });
    });

    it('sends analytics event onClick of upgrade button in UpgradeToShiftDatesAlert', async () => {
      mockLocation({ replace: jest.fn() });
      getAnalyticsService().sendTrackEvent.mockClear();
      datesTabData.datesBannerInfo = {
        contentTypeGatingEnabled: true,
        missedDeadlines: true,
        missedGatedContent: true,
        verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
      };

      axiosMock.onGet(datesUrl).reply(200, datesTabData);
      renderDates();

      const upgradeButton = await waitFor(() => screen.getByRole('button', { name: 'Upgrade to shift due dates' }));
      fireEvent.click(upgradeButton);

      expect(getAnalyticsService().sendTrackEvent).toHaveBeenCalledTimes(1);
      expect(getAnalyticsService().sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.upsell_links_clicked', {
        org_key: 'edX',
        courserun_key: courseId,
        linkCategory: 'personalized_learner_schedules',
        linkName: 'dates_upgrade',
        linkType: 'button',
        pageName: 'dates_tab',
      });
    });
  });

  describe('request count', () => {
    it('requests the course metadata once per load', async () => {
      setMetadata({ user_timezone: 'America/New_York' });
      axiosMock.onGet(datesUrl).reply(200, datesTabData);
      const { queryClient } = renderDates();
      await screen.findByRole('heading', { name: messages.title.defaultMessage });
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));

      expect(axiosMock.history.get.filter((req) => req.url === courseMetadataUrl)).toHaveLength(1);
    });
  });
});
