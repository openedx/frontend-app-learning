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
  const mockData = { metadataModel: 'coursewareMeta' };

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
    } = store.getState().models.coursewareMeta[mockData.courseId].verifiedMode;
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
    } = store.getState().models.coursewareMeta[mockData.courseId].verifiedMode;
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
    const courseMetadata = Factory.build('courseMetadata', { verified_mode: null });
    const testStore = await initializeTestStore({ courseMetadata, excludeFetchSequence: true }, false);
    const { container } = render(<LockPaywall {...mockData} courseId={courseMetadata.id} />, { store: testStore });

    expect(container).toBeEmptyDOMElement();
  });
});
