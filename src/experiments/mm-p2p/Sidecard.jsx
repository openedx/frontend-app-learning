import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import PageLoading from '../../generic/PageLoading';

const SidecardContent = React.lazy(() => import('./SidecardContent'));

const Sidecard = ({ options }) => (
  <Suspense
    fallback={(<PageLoading srMessage="Loading upgrade messaging..." />)}
  >
    <SidecardContent options={options} />
  </Suspense>
);

Sidecard.propTypes = {
  options: PropTypes.shape({
    state: PropTypes.shape({
      upgradeDeadline: PropTypes.string.isRequired,
    }),
    access: PropTypes.shape({
      accessExpirationDate: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
      upgradeUrl: PropTypes.string.isRequired,
    }),
  }),
};

Sidecard.defaultProps = {
  options: {
    state: {
      upgradeDeadline: 'Mar 29, 2021 11:59 PM EST',
    },
    access: {
      accessDeadline: 'Mar 21, 2022 11:59 PM EST',
      price: '$23',
      upgradeUrl: '',
    },
  },
};

export default Sidecard;
