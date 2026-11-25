import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  srPrices: {
    id: 'learning.offer.screenReaderPrices', // historic id
    defaultMessage: 'Original price: {originalPrice}, discount price: {discountedPrice}',
    description: 'Screen reader text for the original and discounted prices of an upgrade',
  },
  srInlinePrices: {
    id: 'learning.upgradeButton.screenReaderInlinePrices',
    defaultMessage: 'Original price: {originalPrice}',
    description: 'Screen reader text for the original price of an upgrade, read before the discounted price shown inline',
  },
});

export default messages;
