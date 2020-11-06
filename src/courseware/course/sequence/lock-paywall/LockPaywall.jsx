import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import VerifiedCert from '../../../../generic/assets/edX_verified_certificate.png';
import { useModel } from '../../../../generic/model-store';

function LockPaywall({
  intl,
  courseId,
}) {
  const course = useModel('courses', courseId);
  const {
    verifiedMode,
  } = course;

  if (!verifiedMode) {
    return null;
  }
  const {
    currencySymbol,
    price,
    upgradeUrl,
  } = verifiedMode;
  return (
    <div className="border border-gray rounded d-flex justify-content-between mt-2 p-3">
      <div>
        <h4 className="font-weight-bold mb-2">
          <FontAwesomeIcon icon={faLock} className="text-black mr-2 ml-1" style={{ fontSize: '2rem' }} />
          <span>{intl.formatMessage(messages['learn.lockPaywall.title'])}</span>
        </h4>
        <p className="mb-0">
          <span>{intl.formatMessage(messages['learn.lockPaywall.content'])}</span>
          &nbsp;
          <a href={upgradeUrl}>
            {intl.formatMessage(messages['learn.lockPaywall.upgrade.link'], {
              currencySymbol,
              price,
            })}
          </a>
        </p>
      </div>
      <div>
        <img
          alt={intl.formatMessage(messages['learn.lockPaywall.example.alt'])}
          src={VerifiedCert}
          className="border-0"
          style={{ height: '70px' }}
        />
      </div>
    </div>
  );
}
LockPaywall.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};
export default injectIntl(LockPaywall);
