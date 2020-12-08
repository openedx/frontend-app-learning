/* This file should be deleted after REV1512 value prop experiment */
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import classNames from 'classnames';

import messages from './messages';
import VerifiedCert from '../../../../generic/assets/edX_verified_certificate.png';
import { useModel } from '../../../../generic/model-store';
import './LockPaywall.scss';

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

  let upgradeButtonText;
  if (document.querySelector('.price.discount') !== null) {
    let discountPrice = document.querySelector('.price.discount').textContent;
    if (discountPrice !== null) {
      discountPrice = discountPrice.replace(/[^0-9.]/g, '');
    }
    upgradeButtonText = (
      <>
        <span className="font-weight-bold" style={{ paddingRight: '5px' }}>
          {intl.formatMessage(messages['learn.lockPaywall.upgrade.link.text'], {
            currencySymbol,
            price: discountPrice,
          })}
        </span>
        <span style={{ textDecoration: 'line-through' }}>
          ({intl.formatMessage(messages['learn.lockPaywall.upgrade.link.strikethrough.price'], {
          currencySymbol,
          price,
        })})
        </span>
      </>
    );
  } else {
    upgradeButtonText = (
      <>
        <span className="font-weight-bold">
          {intl.formatMessage(messages['learn.lockPaywall.upgrade.link.text'], {
            currencySymbol,
            price,
          })}
        </span>
      </>
    );
  }

  const circleCheckIcon = (
    <FontAwesomeIcon
      icon={faCheckCircle}
      className="float-left mt-1"
      fixedWidth
      aria-hidden="true"
      title="icon"
      style={{ marginRight: '15px' }}
    />
  );
  const verifiedCertificateLink = (
    <b>
      <a
        className="text-gray-700 value_prop_verified_certificate_link"
        style={{ textDecoration: 'underline' }}
        href="https://www.edx.org/verified-certificate"
      >
        {intl.formatMessage(messages['lock.description.reason1.linkText'])}
      </a>
    </b>
  );

  const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
  const isMobile = Boolean(
    userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i),
  );

  return (
    <div className="border border-gray d-flex justify-content-between mt-2 p-3 value-prop-lock-paywall-banner">
      <div className={classNames({ 'is-mobile': isMobile })}>
        <div className="font-weight-bold top-banner-text-header">
          <FontAwesomeIcon icon={faLock} className="text-black mr-2 ml-1 lock-icon" style={{ fontSize: '1rem' }} />
          <span>{intl.formatMessage(messages['lock.title'])}</span>
        </div>
        <div className="font-weight top-banner-text">
          {intl.formatMessage(messages['lock.title.text'])}
        </div>

        <div className="mb-0">
          <div className="certificate-image-banner-container">
            <img
              alt={intl.formatMessage(messages['learn.lockPaywall.example.alt'])}
              src={VerifiedCert}
              className="border-0 certificate-image-banner"
            />
          </div>
          <div style={{ float: 'left', paddingLeft: '18px' }}>
            <div style={{ paddingBottom: '10px' }}>{intl.formatMessage(messages['lock.description.start'])}</div>

            <div className="listItemRow">
              <div className="checkCircleIconWrapper">{circleCheckIcon}</div>
              <div className="listItemWrapper"><FormattedMessage
                id="lock.description.reason1"
                defaultMessage="Earn a {verifiedCertificateLink} of completion to showcase on your resume"
                values={{ verifiedCertificateLink }}
              />
              </div>
            </div>

            <div className="listItemRow">
              <div className="checkCircleIconWrapper">{circleCheckIcon}</div>
              <div className="listItemWrapper">
                {intl.formatMessage(messages['lock.description.reason2'])}
                <span className="font-weight-bold">{intl.formatMessage(messages['lock.description.reason2.highlight'])}</span>
              </div>
            </div>

            <div className="listItemRow">
              <div className="checkCircleIconWrapper">{circleCheckIcon}</div>
              <div className="listItemWrapper">
                <span className="font-weight-bold">{intl.formatMessage(messages['lock.description.reason3.highlight'])}</span>
                {intl.formatMessage(messages['lock.description.reason3'])}
              </div>
            </div>

            <div className="listItemRow">
              <div className="checkCircleIconWrapper">{circleCheckIcon}</div>
              <div className="listItemWrapper">
                {intl.formatMessage(messages['lock.description.reason4.beginning'])}
                <span className="font-weight-bold">{intl.formatMessage(messages['lock.description.reason4.highlight'])}</span>
                {intl.formatMessage(messages['lock.description.reason4.end'])}
              </div>
            </div>
          </div>

          <br clear="both" />
          <div className="value-prop-upgrade-button-container">
            <Button variant="primary" href={upgradeUrl} className="value_prop_lock_paywall_upgrade_link">
              {upgradeButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
LockPaywall.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};
export default injectIntl(LockPaywall);
