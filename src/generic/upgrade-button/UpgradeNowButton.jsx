import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';

import FormattedPricing from './FormattedPricing';

const UpgradeNowButton = (props) => {
  const {
    offer = null,
    variant = 'primary',
    onClick = null,
    verifiedMode,
    ...rest
  } = props;

  // Prefer offer's url in case it is different (might hold a coupon code that the normal does not)
  const url = offer ? offer.upgradeUrl : verifiedMode.upgradeUrl;

  return (
    <Button
      variant={variant}
      href={url}
      onClick={onClick}
      {...rest}
    >
      <FormattedMessage
        id="learning.upgradeNowButton.buttonText"
        defaultMessage="Upgrade now for {pricing}"
        values={{
          pricing: (
            <FormattedPricing
              offer={offer}
              verifiedMode={verifiedMode}
            />
          ),
        }}
      />
    </Button>
  );
};


UpgradeNowButton.propTypes = {
  offer: PropTypes.shape({
    upgradeUrl: PropTypes.string.isRequired,
  }),
  onClick: PropTypes.func,
  verifiedMode: PropTypes.shape({
    upgradeUrl: PropTypes.string.isRequired,
  }).isRequired,
  variant: PropTypes.string,
};

export default UpgradeNowButton;
