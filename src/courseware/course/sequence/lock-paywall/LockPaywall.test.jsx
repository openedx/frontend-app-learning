import React from 'react';
import { Factory } from 'rosie';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import {
  fireEvent, initializeTestStore, render, screen,
} from '../../../../setupTest';
import LockPaywall from './LockPaywall';

jest.mock('@edx/frontend-platform/analytics');

describe('Lock Paywall', () => {
  let store;
  const mockData = { notificationTrayVisible: false };

  beforeAll(async () => {
    store = await initializeTestStore();
    const { courseware } = store.getState();
    Object.assign(mockData, {
      courseId: courseware.courseId,
    });
  });

  it('displays unlock link with price', () => {
    const {
      currencySymbol,
      price,
      upgradeUrl,
    } = store.getState().models.courseHomeMeta[mockData.courseId].verifiedMode;
    render(<LockPaywall {...mockData} />);

    const upgradeLink = screen.getByRole('link', { name: `Upgrade for ${currencySymbol}${price}` });
    expect(upgradeLink).toHaveAttribute('href', `${upgradeUrl}`);
  });

  it('displays discounted price if there is an offer/first time purchase', async () => {
    const courseMetadata = Factory.build('courseMetadata', {
      offer: {
        code: 'EDXWELCOME',
        expiration_date: '2070-01-01T12:00:00Z',
        original_price: '$100',
        discounted_price: '$85',
        percentage: 15,
        upgrade_url: 'https://example.com/upgrade',
      },
    });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    render(<LockPaywall {...mockData} courseId={courseMetadata.id} />, { store: testStore });

    expect(screen.getByText(/Upgrade for/).textContent).toMatch('$85 ($100)');
  });

  it('sends analytics event onClick of unlock link', () => {
    sendTrackEvent.mockClear();

    const {
      currencySymbol,
      price,
    } = store.getState().models.courseHomeMeta[mockData.courseId].verifiedMode;
    render(<LockPaywall {...mockData} />);

    const upgradeLink = screen.getByRole('link', { name: `Upgrade for ${currencySymbol}${price}` });
    fireEvent.click(upgradeLink);

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.upsell_links_clicked', {
      org_key: 'edX',
      courserun_key: mockData.courseId,
      linkCategory: '(none)',
      linkName: 'in_course_upgrade',
      linkType: 'link',
      pageName: 'in_course',
    });
  });

  it('does not display anything if course does not have verified mode', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { verified_mode: null });
    const testStore = await initializeTestStore({ courseHomeMetadata, excludeFetchSequence: true }, false);
    const { container } = render(<LockPaywall {...mockData} courseId={courseHomeMetadata.id} />, { store: testStore });

    expect(container).toBeEmptyDOMElement();
  });

  it('displays past expiration message if expiration date has expired', async () => {
    const courseMetadata = Factory.build('courseMetadata', {
      access_expiration: {
        expiration_date: '1995-02-22T05:00:00Z',
      },
      marketing_url: 'https://example.com/course-details',
    });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    render(<LockPaywall {...mockData} courseId={courseMetadata.id} />, { store: testStore });
    expect(screen.getByText('The upgrade deadline for this course passed. To upgrade, enroll in the next available session.')).toBeInTheDocument();
    expect(screen.getByText('View Course Details'))
      .toHaveAttribute('href', 'https://example.com/course-details');
  });

  it('sends analytics event onClick of past expiration course details link', async () => {
    sendTrackEvent.mockClear();
    const courseMetadata = Factory.build('courseMetadata', {
      access_expiration: {
        expiration_date: '1995-02-22T05:00:00Z',
      },
      marketing_url: 'https://example.com/course-details',
    });
    const testStore = await initializeTestStore({ courseMetadata }, false);
    render(<LockPaywall {...mockData} courseId={courseMetadata.id} />, { store: testStore });
    const courseDetailsLink = await screen.getByText('View Course Details');
    fireEvent.click(courseDetailsLink);

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.gated_content.past_expiration.link_clicked', {
      org_key: 'edX',
      courserun_key: mockData.courseId,
      linkCategory: 'gated_content',
      linkName: 'course_details',
      linkType: 'link',
      pageName: 'in_course',
    });
  });
});
