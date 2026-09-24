import React from 'react';
import { Factory } from 'rosie';
import { camelCaseObject, getConfig, mergeConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { breakpoints } from '@openedx/paragon';
import { QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';

import {
  act,
  createTestQueryClient,
  initializeMockApp,
  initializeTestStore,
  render,
  screen,
  seedQueryData,
} from '../../setupTest';
import { courseHomeQueryKeys } from '../../course-home/data/queryKeys';
import StreakModal from './StreakCelebrationModal';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('Loaded Tab Page', () => {
  let mockData;
  let testStore;
  let axiosMock;
  let queryClient;
  const calculateUrl = `${getConfig().ECOMMERCE_BASE_URL}/api/v2/baskets/calculate/?code=ZGY11119949&sku=8CF08E5&username=MockUser`;
  const courseMetadata = Factory.build('courseMetadata');
  const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { streak_length_to_celebrate: 3 } });

  function setDiscount(percent) {
    mockData.streakDiscountCouponEnabled = true;
    axiosMock.onGet(calculateUrl).reply(200, {
      total_incl_tax: 100 - percent,
      total_incl_tax_excl_discounts: 100,
    });
  }

  function setDiscountViaDiscountCodeInfo(percent) {
    const discountURLParams = new URLSearchParams();
    discountURLParams.append('code', 'ZGY11119949');
    discountURLParams.append('course_run_key', courseMetadata.id);
    const discountURL = `${getConfig().DISCOUNT_CODE_INFO_URL}?${discountURLParams.toString()}`;

    mockData.streakDiscountCouponEnabled = true;
    axiosMock.onGet(discountURL).reply(200, {
      isApplicable: true,
      discountPercentage: percent / 100,
    });
  }

  function setDiscountError() {
    mockData.streakDiscountCouponEnabled = true;
    axiosMock.onGet(calculateUrl).reply(500);
  }

  // The suite's own axios adapter replaces the one mocking the metadata endpoint, so the modal
  // reads the course metadata from a seeded query rather than a mounted fetch.
  async function renderModal() {
    queryClient = createTestQueryClient();
    seedQueryData(
      queryClient,
      courseHomeQueryKeys.metadata(mockData.courseId),
      testStore.getState().models.courseHomeMeta[mockData.courseId],
    );
    await act(async () => render(
      <QueryClientProvider client={queryClient}>
        <StreakModal {...mockData} />
      </QueryClientProvider>,
      { store: testStore },
    ));
  }

  beforeAll(async () => {
    mockData = { // props for StreakModal
      closeStreakCelebration: jest.fn(),
      courseId: courseMetadata.id,
      isStreakCelebrationOpen: true,
      streakLengthToCelebrate: 3,
      verifiedMode: camelCaseObject(courseHomeMetadata.verified_mode),
    };

    testStore = await initializeTestStore({ courseMetadata, courseHomeMetadata }, false);
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  beforeEach(() => {
    global.innerWidth = breakpoints.medium.minWidth;
  });

  it('shows streak celebration modal', async () => {
    await renderModal();

    expect(screen.getByText('3 day streak')).toBeInTheDocument();
    expect(screen.getByText('Keep it up, you’re on a roll!')).toBeInTheDocument();
    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.celebration.streak.opened', {
      org_key: courseHomeMetadata.org,
      courserun_key: mockData.courseId,
      is_staff: false,
    });
  });

  it('clears the streak in the course metadata query when the modal closes', async () => {
    await renderModal();
    const user = userEvent.setup();
    const queryKey = courseHomeQueryKeys.metadata(mockData.courseId);
    expect(queryClient.getQueryData(queryKey).celebrations.streakLengthToCelebrate).toBe(3);

    await user.click(await screen.findByRole('button', { name: /keep it up/i }));

    expect(mockData.closeStreakCelebration).toHaveBeenCalledTimes(1);
    const { celebrations, org } = queryClient.getQueryData(queryKey);
    expect(celebrations.streakLengthToCelebrate).toBeNull();
    expect(org).toBe(courseHomeMetadata.org);
  });

  it('shows normal streak celebration modal when discount call fails', async () => {
    setDiscountError();
    await renderModal();

    // This text is only for the non-discount case
    expect(screen.getByText('Keep it up')).toBeInTheDocument();
  });

  it('shows normal streak celebration modal when discount is zero', async () => {
    setDiscount(0);
    await renderModal();

    // This text is only for the non-discount case
    expect(screen.getByText('Keep it up')).toBeInTheDocument();
  });

  it('shows discount version of streak celebration modal when available', async () => {
    global.innerWidth = breakpoints.extraSmall.maxWidth;
    setDiscount(14);
    await renderModal();

    const endDateText = `Ends ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString({ timeZone: 'UTC' })}.`;
    expect(screen.getByText('You’ve unlocked a 14% off discount when you upgrade this course for a limited time only.', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(endDateText, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Continue with course')).toBeInTheDocument();
    expect(screen.queryByText('Keep it up')).not.toBeInTheDocument();
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.course.streak_discount_enabled', {
      course_id: mockData.courseId,
      sku: mockData.verifiedMode.sku,
    });
  });

  it('shows discount version of streak celebration modal when discount available and info fetched using DISCOUNT_CODE_INFO_URL', async () => {
    mergeConfig({ DISCOUNT_CODE_INFO_URL: 'http://localhost:8140/lms/discount-code-info/' });

    global.innerWidth = breakpoints.extraSmall.maxWidth;
    setDiscountViaDiscountCodeInfo(14);
    await renderModal();

    const endDateText = `Ends ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString({ timeZone: 'UTC' })}.`;
    expect(screen.getByText('You’ve unlocked a 14% off discount when you upgrade this course for a limited time only.', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(endDateText, { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Continue with course')).toBeInTheDocument();
    expect(screen.queryByText('Keep it up')).not.toBeInTheDocument();
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.course.streak_discount_enabled', {
      course_id: mockData.courseId,
      sku: mockData.verifiedMode.sku,
    });
  });
});
