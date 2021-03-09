import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

import PageLoading from '../../generic/PageLoading';
import VerifiedCert from '../../generic/assets/edX_certificate.png';

const LockPaywall = ({ options }) => {
  if (!(options.meta.gradedLock || options.meta.verifiedLock)) {
    return null;
  }
  return (
    <Suspense
      fallback={(<PageLoading srMessage="Loading locked content messaging..." />)}
    >
      <div className="border border-gray rounded d-flex justify-content-between mt-2 p-3">
        <div>
          <h4 className="font-weight-bold mb-2">
            <FontAwesomeIcon icon={faLock} className="text-black mr-2 ml-1" style={{ fontSize: '2rem' }} />
            <span>Verified Track Access</span>
          </h4>
          <p className="mb-0">
            <span>
              { options.meta.gradedLock && (
                <>Grades assessments are available to Verified Track learners.</>
              )}
              { options.meta.verifiedLock && (
                <>
                  Audit access is limited to the first two weeks of scheduled content.
                  &nbsp; To access the full course content,
                </>
              )}
            </span>
            &nbsp;
            <a className="lock_paywall_upgrade_link" href={options.access.upgradeUrl}>
              { options.meta.gradedLock ? 'Upgrade to unlock ' : 'upgrade to a verified certificate.' }
              ({options.access.price})
            </a>
          </p>
        </div>
        <div>
          <img
            alt="Example Certificate"
            src={VerifiedCert}
            className="border-0"
            style={{ height: '70px' }}
          />
        </div>
      </div>
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
