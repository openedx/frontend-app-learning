import React from 'react';
import { Factory } from 'rosie';
import { initializeTestStore, render, screen } from '../../../../setupTest';
import LockPaywall from './LockPaywall';

describe('Lock Paywall', () => {
  let store;
  const mockData = {};

  beforeAll(async () => {
    store = await initializeTestStore();
    const { courseware } = store.getState();
    mockData.courseId = courseware.courseId;
  });

  it('displays message along with lock icon', () => {
    const { container } = render(<LockPaywall {...mockData} />);

    const lockIcon = container.querySelector('svg');
    expect(lockIcon).toHaveClass('fa-lock');
    expect(lockIcon.parentElement).toHaveTextContent('Verified Track Access');
  });

  it('displays unlock link with price', () => {
    const {
      currencySymbol,
      price,
      upgradeUrl,
    } = store.getState().models.coursewareMeta[mockData.courseId].verifiedMode;
    render(<LockPaywall {...mockData} />);

    const upgradeLink = screen.getByRole('link', { name: `Upgrade to unlock (${currencySymbol}${price})` });
    expect(upgradeLink).toHaveAttribute('href', `${upgradeUrl}`);
  });

  it('does not display anything if course does not have verified mode', async () => {
    const courseMetadata = Factory.build('courseMetadata', { verified_mode: null });
    const testStore = await initializeTestStore({ courseMetadata, excludeFetchSequence: true }, false);
    const { container } = render(<LockPaywall {...mockData} courseId={courseMetadata.id} />, { store: testStore });

    expect(container).toBeEmptyDOMElement();
  });
});
