import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';

import FormattedPricing from './FormattedPricing';

const UpgradeButton = (props) => {
  const {
    offer,
    variant,
    onClick,
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

UpgradeButton.defaultProps = {
  offer: null,
  onClick: null,
  variant: 'primary',
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
