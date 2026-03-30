import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { WatchOutline } from '@openedx/paragon/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import messages from './messages';

const UpgradeIcon = ({ status, upgradeColor }) => {
  const intl = useIntl();
  return (
    <>
      <Icon src={WatchOutline} className="m-0 m-auto" alt={intl.formatMessage(messages.openUpgradeTrigger)} />
      {status === 'active'
        ? (
          <span
            className={classNames(upgradeColor, 'rounded-circle p-1 position-absolute')}
            data-testid="upgrade-status-dot"
            style={{
              top: '0.3rem',
              right: '0.55rem',
            }}
          />
        )
        : null}
    </>
  );
};

UpgradeIcon.defaultProps = {
  status: null,
};

UpgradeIcon.propTypes = {
  status: PropTypes.string,
  upgradeColor: PropTypes.string.isRequired,
};

export default UpgradeIcon;
