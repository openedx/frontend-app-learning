import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';

import FormattedPricing from './FormattedPricing';

const UpgradeButton = (props) => {
  const {
    offer = null,
    variant = 'primary',
    onClick = null,
    verifiedMode,
    ...rest
  } = props;

  // Prefer offer's url in case it is ever different (though it is not at time of this writing)
  const url = offer ? offer.upgradeUrl : verifiedMode.upgradeUrl;

  return (
    <Button
      variant={variant}
      href={url}
      onClick={onClick}
      {...rest}
    >
      <div>
        <FormattedMessage
          id="learning.upgradeButton.buttonText"
          defaultMessage="Upgrade for {pricing}"
          values={{
            pricing: (
              <FormattedPricing
                offer={offer}
                verifiedMode={verifiedMode}
              />
            ),
          }}
        />
      </div>
    </Button>
  );
};


UpgradeButton.propTypes = {
  offer: PropTypes.shape({
    upgradeUrl: PropTypes.string.isRequired,
  }),
  onClick: PropTypes.func,
  verifiedMode: PropTypes.shape({
    upgradeUrl: PropTypes.string.isRequired,
  }).isRequired,
  variant: PropTypes.string,
};

export default UpgradeButton;
