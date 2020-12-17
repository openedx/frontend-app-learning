import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';

function FormattedPricing(props) {
  const {
    inline,
    intl,
    offer,
    verifiedMode,
  } = props;

  if (!offer) {
    const {
      currencySymbol,
      price,
    } = verifiedMode;
    return `${currencySymbol}${price}`;
  }

  const {
    discountedPrice,
    originalPrice,
  } = offer;

  // The inline style is meant for being embedded in a sentence - it bolds the discount and leaves the original price
  // as a parenthetical. The normal styling is more suited for a button, where the price and discount are side by side.
  if (inline) {
    return (
      <>
        <span className="font-weight-bold">{discountedPrice}</span>
        &nbsp;(
        <span className="sr-only">
          {intl.formatMessage(messages.srInlinePrices, { originalPrice })}
        </span>
        <span aria-hidden="true">
          <del>{originalPrice}</del>
        </span>
        )
      </>
    );
  }

  return (
    <>
      <span className="sr-only">
        {intl.formatMessage(messages.srPrices, { discountedPrice, originalPrice })}
      </span>
      <span aria-hidden="true">
        {/* the price discount and price original classes can be removed post REV-1512 experiment */}
        <span className="price discount">{discountedPrice}</span> <del className="price original">{originalPrice}</del>
      </span>
    </>
  );
}

FormattedPricing.defaultProps = {
  inline: false,
  offer: null,
  verifiedMode: null,
};

FormattedPricing.propTypes = {
  inline: PropTypes.bool,
  intl: intlShape.isRequired,
  offer: PropTypes.shape({
    discountedPrice: PropTypes.string.isRequired,
    originalPrice: PropTypes.string.isRequired,
    upgradeUrl: PropTypes.string.isRequired,
  }),
  verifiedMode: PropTypes.shape({
    currencySymbol: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    upgradeUrl: PropTypes.string.isRequired,
  }),
};

export default injectIntl(FormattedPricing);
