import { Factory } from 'rosie';
import {
  getAnalyticsService, getAuthenticatedHttpClient, getSiteConfig, mergeAppConfig,
} from '@openedx/frontend-base';
import { breakpoints } from '@openedx/paragon';
import {
  act, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';

import { appId } from '@src/constants';
import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import routes from '@src/routes';
import { renderRoutes } from '@src/tests/render';
import { appendBrowserTimezoneToUrl } from '@src/utils';

const { sendTrackEvent } = getAnalyticsService();

// The streak modal is the tab page frame's, on every course tab; these cases reach it on the dates tab.
describe('StreakModal', () => {
  const ecommerceBaseUrl = 'http://localhost:18130';
  const discountCodeInfoUrl = 'http://localhost:8140/lms/discount-code-info/';
  const discountCode = 'ZGY11119949';
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString();
  const discountText = (percent) => `You’ve unlocked a ${percent}% off discount when you upgrade this course for a limited time only.`;

  let axiosMock;
  let courseHomeMetadata;

  beforeAll(() => import('@src/course-home/dates-tab'));

  beforeEach(() => {
    global.innerWidth = breakpoints.medium.minWidth;
    sendTrackEvent.mockClear();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    act(() => mergeAppConfig(appId, { DISCOUNT_CODE_INFO_URL: null, ECOMMERCE_BASE_URL: null }));
  });

  const calculateUrl = () => (
    `${ecommerceBaseUrl}/api/v2/baskets/calculate/?code=${discountCode}&sku=${courseHomeMetadata.verified_mode.sku}&username=MockUser`
  );

  const renderTab = (celebrations, attributes = {}) => {
    courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations, ...attributes });
    const { lmsBaseUrl } = getSiteConfig();
    axiosMock.onGet(appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/course_home/course_metadata/${courseHomeMetadata.id}`))
      .reply(200, courseHomeMetadata);
    axiosMock.onGet(`${lmsBaseUrl}/api/course_home/dates/${courseHomeMetadata.id}`).reply(200, Factory.build('datesTabData'));
    return renderRoutes(routes, `/learning/course/${courseHomeMetadata.id}/dates`);
  };

  // The modal shows the spinner until the discount question has an answer, then one of its two footers.
  const findSettledModal = async () => {
    const dialog = await screen.findByRole('dialog', { name: '3 day streak' });
    await waitFor(() => expect(within(dialog).queryByRole('status')).not.toBeInTheDocument());
    return dialog;
  };

  it('does not open with no streak to celebrate', async () => {
    renderTab(null);

    await screen.findByRole('heading', { name: 'Important dates' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on a course tab with a streak to celebrate, and tracks it', async () => {
    renderTab({ streak_length_to_celebrate: 3 });

    const dialog = await findSettledModal();
    expect(dialog).toHaveTextContent('Keep it up, you’re on a roll!');
    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.celebration.streak.opened', {
      org_key: courseHomeMetadata.org,
      courserun_key: courseHomeMetadata.id,
      is_staff: false,
    });
  });

  it('closes, and clears the streak in the course metadata query so it shows once', async () => {
    const { queryClient } = renderTab({ streak_length_to_celebrate: 3 });
    const user = userEvent.setup();
    const { queryKey } = courseHomeMetaQuery(courseHomeMetadata.id);

    const dialog = await findSettledModal();
    expect(queryClient.getQueryData(queryKey).celebrations.streakLengthToCelebrate).toBe(3);
    await user.click(within(dialog).getByRole('button', { name: /keep it up/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const { celebrations, org } = queryClient.getQueryData(queryKey);
    expect(celebrations.streakLengthToCelebrate).toBeNull();
    expect(org).toBe(courseHomeMetadata.org);
  });

  it('shows no discount line with the discount enabled but neither discount service configured', async () => {
    renderTab({ streak_length_to_celebrate: 3, streak_discount_enabled: true });

    const dialog = await findSettledModal();
    expect(within(dialog).getByText('Keep it up')).toBeInTheDocument();
    expect(axiosMock.history.get.filter(request => request.url.includes(discountCode))).toHaveLength(0);
  });

  it('shows no discount line when the course has no verified mode', async () => {
    mergeAppConfig(appId, { ECOMMERCE_BASE_URL: ecommerceBaseUrl });
    renderTab({ streak_length_to_celebrate: 3, streak_discount_enabled: true }, { verified_mode: null });

    const dialog = await findSettledModal();
    expect(within(dialog).getByText('Keep it up')).toBeInTheDocument();
    expect(axiosMock.history.get.filter(request => request.url.includes(discountCode))).toHaveLength(0);
  });

  it('shows the normal modal when the ecommerce call fails', async () => {
    mergeAppConfig(appId, { ECOMMERCE_BASE_URL: ecommerceBaseUrl });
    axiosMock.onGet(/baskets\/calculate/).reply(500);
    renderTab({ streak_length_to_celebrate: 3, streak_discount_enabled: true });

    const dialog = await findSettledModal();
    expect(within(dialog).getByText('Keep it up')).toBeInTheDocument();
  });

  it('shows the normal modal when the discount is zero', async () => {
    mergeAppConfig(appId, { ECOMMERCE_BASE_URL: ecommerceBaseUrl });
    axiosMock.onGet(/baskets\/calculate/).reply(200, { total_incl_tax: 100, total_incl_tax_excl_discounts: 100 });
    renderTab({ streak_length_to_celebrate: 3, streak_discount_enabled: true });

    const dialog = await findSettledModal();
    expect(within(dialog).getByText('Keep it up')).toBeInTheDocument();
  });

  it('shows the discount from ecommerce, with the upgrade button, on a narrow screen', async () => {
    global.innerWidth = breakpoints.extraSmall.maxWidth;
    mergeAppConfig(appId, { ECOMMERCE_BASE_URL: ecommerceBaseUrl });
    axiosMock.onGet(/baskets\/calculate/).reply(200, { total_incl_tax: 86, total_incl_tax_excl_discounts: 100 });
    renderTab({ streak_length_to_celebrate: 3, streak_discount_enabled: true });

    const dialog = await findSettledModal();
    expect(axiosMock.history.get.map(request => request.url)).toContain(calculateUrl());
    expect(within(dialog).getByText(discountText(14), { exact: false })).toBeInTheDocument();
    expect(within(dialog).getByText(`Ends ${endDate}.`, { exact: false })).toBeInTheDocument();
    expect(within(dialog).getByText('Continue with course')).toBeInTheDocument();
    expect(within(dialog).queryByText('Keep it up')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: /upgrade now/i }))
      .toHaveAttribute('href', `${courseHomeMetadata.verified_mode.upgrade_url}&code=${discountCode}`);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.course.streak_discount_enabled', {
      course_id: courseHomeMetadata.id,
      sku: courseHomeMetadata.verified_mode.sku,
    });
  });

  it('shows the discount from the discount-code service when DISCOUNT_CODE_INFO_URL is set, on a wide screen', async () => {
    global.innerWidth = breakpoints.extraLarge.minWidth;
    mergeAppConfig(appId, { DISCOUNT_CODE_INFO_URL: discountCodeInfoUrl, ECOMMERCE_BASE_URL: ecommerceBaseUrl });
    axiosMock.onGet(new RegExp(`^${discountCodeInfoUrl}`)).reply(200, { isApplicable: true, discountPercentage: 0.14 });
    renderTab({ streak_length_to_celebrate: 3, streak_discount_enabled: true });

    const dialog = await findSettledModal();
    const params = new URLSearchParams({ code: discountCode, course_run_key: courseHomeMetadata.id });
    expect(axiosMock.history.get.map(request => request.url)).toContain(`${discountCodeInfoUrl}?${params.toString()}`);
    expect(axiosMock.history.get.filter(request => request.url.includes('baskets'))).toHaveLength(0);
    expect(within(dialog).getByText(discountText(14), { exact: false })).toBeInTheDocument();
    expect(within(dialog).getByText('Continue with course')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: /upgrade now/i })).toBeInTheDocument();
  });
});
