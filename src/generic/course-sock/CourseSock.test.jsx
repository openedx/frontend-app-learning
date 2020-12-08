import React from 'react';
import {
  render, screen, fireEvent, initializeMockApp,
} from '../../setupTest';
import CourseSock from './CourseSock';

describe('Course Sock', () => {
  const mockData = {
    verifiedMode: {
      upgradeUrl: 'test-url',
      price: 1234,
      currency: 'dollars',
      currencySymbol: '$',
    },
  };

  beforeAll(async () => {
    // We need to mock AuthService to implicitly use `getAuthenticatedUser` within `AppContext.Provider`.
    await initializeMockApp();
  });

  it('hides upsell information on load', () => {
    render(<CourseSock {...mockData} />);

    expect(screen.getByRole('button', { name: 'Learn About Verified Certificates' })).toBeInTheDocument();
    expect(screen.queryByText('edX Verified Certificate')).not.toBeInTheDocument();
  });

  it('handles click', () => {
    render(<CourseSock {...mockData} />);
    const upsellButton = screen.getByRole('button', { name: 'Learn About Verified Certificates' });
    fireEvent.click(upsellButton);

    expect(screen.getByText('edX Verified Certificate')).toBeInTheDocument();
    const { currencySymbol, price, currency } = mockData.verifiedMode;
    expect(screen.getByText(`Upgrade (${currencySymbol}${price} ${currency})`)).toBeInTheDocument();

    fireEvent.click(upsellButton);
    expect(screen.queryByText('edX Verified Certificate')).not.toBeInTheDocument();
  });
});
