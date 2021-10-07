import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import FormattedPricing from './FormattedPricing';

function UpgradeButton(props) {
  const {
    intl,
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
    </Button>
  );
}

UpgradeButton.defaultProps = {
  offer: null,
  onClick: null,
  variant: 'primary',
};

UpgradeButton.propTypes = {
  intl: intlShape.isRequired,
  offer: PropTypes.shape({
    upgradeUrl: PropTypes.string.isRequired,
  }),
  onClick: PropTypes.func,
  verifiedMode: PropTypes.shape({
    upgradeUrl: PropTypes.string.isRequired,
  }).isRequired,
  variant: PropTypes.string,
};

export default injectIntl(UpgradeButton);
