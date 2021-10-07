import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import PageLoading from '../../generic/PageLoading';

const LockPaywallContent = React.lazy(() => import('./LockPaywallContent'));

const LockPaywall = ({ options }) => {
  if (!(options.meta.gradedLock || options.meta.verifiedLock)) {
    return null;
  }
  return (
    <Suspense
      fallback={(<PageLoading srMessage="Loading locked content messaging..." />)}
    >
      <LockPaywallContent options={options} />
    </Suspense>
  );
};
LockPaywall.propTypes = {
  options: PropTypes.shape({
    access: PropTypes.shape({
      upgradeUrl: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
    }),
    meta: PropTypes.shape({
      gradedLock: PropTypes.bool.isRequired,
      verifiedLock: PropTypes.bool.isRequired,
    }),
  }),
};

LockPaywall.defaultProps = {
  options: {
    access: {
      upgradeUrl: '',
      price: '$23',
    },
    meta: {
      gradedLock: false,
      verifiedLock: false,
    },
  },
};
export default LockPaywall;
