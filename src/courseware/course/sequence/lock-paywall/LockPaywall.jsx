import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import VerifiedCert from './assets/edx-verified-mini-cert.png';
import { useModel } from '../../../../model-store';

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
    <div className="unit-content-container content-paywall">
      <div>
        <h4>
          <FontAwesomeIcon icon={faLock} />
          <span>{intl.formatMessage(messages['learn.lockPaywall.title'])}</span>
        </h4>
        <p>
          <span>{intl.formatMessage(messages['learn.lockPaywall.content'])}</span>
          &nbsp;
          <a href={upgradeUrl}>
            {intl.formatMessage(messages['learn.lockPaywall.upgrade.link'], {
              currencySymbol: currencySymbol,
              price: price,
            })}
          </a>
        </p>
      </div>
      <div>
        <img
          alt={intl.formatMessage(messages['learn.lockPaywall.example.alt'])}
          src={VerifiedCert}
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
