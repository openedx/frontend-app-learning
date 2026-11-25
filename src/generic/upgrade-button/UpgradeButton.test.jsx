import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { FormattedPricing, UpgradeButton, UpgradeNowButton } from '.';

const verifiedMode = { currencySymbol: '$', price: 149, upgradeUrl: 'https://example.com/upgrade' };
const offer = {
  discountedPrice: '$126.65',
  originalPrice: '$149.00',
  upgradeUrl: 'https://example.com/offer',
};

describe('UpgradeButton', () => {
  it('links to the verified mode upgrade at its price', () => {
    render(<UpgradeButton verifiedMode={verifiedMode} />);

    expect(screen.getByRole('link', { name: 'Upgrade for $149' })).toHaveAttribute('href', verifiedMode.upgradeUrl);
  });

  it('links to the offer with its discounted and original prices', () => {
    render(<UpgradeButton offer={offer} verifiedMode={verifiedMode} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', offer.upgradeUrl);
    expect(link).toHaveTextContent('Original price: $149.00, discount price: $126.65');
  });
});

describe('UpgradeNowButton', () => {
  it('links to the verified mode upgrade at its price', () => {
    render(<UpgradeNowButton verifiedMode={verifiedMode} />);

    expect(screen.getByRole('link', { name: 'Upgrade now for $149' })).toHaveAttribute('href', verifiedMode.upgradeUrl);
  });

  it('links to the offer when there is one', () => {
    render(<UpgradeNowButton offer={offer} verifiedMode={verifiedMode} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', offer.upgradeUrl);
  });
});

describe('FormattedPricing', () => {
  it('bolds the discounted price and gives the original one in parentheses when inline', () => {
    const { container } = render(<FormattedPricing inline offer={offer} verifiedMode={verifiedMode} />);

    expect(container.querySelector('.font-weight-bold')).toHaveTextContent(offer.discountedPrice);
    expect(container.querySelector('del')).toHaveTextContent(offer.originalPrice);
    expect(screen.getByText('Original price: $149.00')).toHaveClass('sr-only');
  });
});
