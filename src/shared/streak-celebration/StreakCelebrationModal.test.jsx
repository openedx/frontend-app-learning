import React from 'react';
import { Factory } from 'rosie';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { breakpoints } from '@edx/paragon';
import MockAdapter from 'axios-mock-adapter';

import {
  act,
  initializeMockApp,
  initializeTestStore,
  render,
  screen,
} from '../../setupTest';
import StreakModal from './StreakCelebrationModal';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('Loaded Tab Page', () => {
  let mockData;
  let testStore;
  let axiosMock;
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

  function setDiscountError() {
    mockData.streakDiscountCouponEnabled = true;
    axiosMock.onGet(calculateUrl).reply(500);
  }

  async function renderModal() {
    await act(async () => render(<StreakModal {...mockData} />, { store: testStore }));
  }

  beforeAll(async () => {
    mockData = { // props for StreakModal
      closeStreakCelebration: jest.fn(),
      courseId: courseMetadata.id,
      isStreakCelebrationOpen: true,
      metadataModel: 'coursewareMeta',
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
    expect(screen.getByText('You’ve unlocked a 14% off discount when you upgrade this course for a limited time only.')).toBeInTheDocument();
    expect(screen.getByText(endDateText)).toBeInTheDocument();
    expect(screen.getByText('Continue with course')).toBeInTheDocument();
    expect(screen.queryByText('Keep it up')).not.toBeInTheDocument();
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.course.streak_discount_enabled', {
      course_id: mockData.courseId,
      sku: mockData.verifiedMode.sku,
    });
  });
});
