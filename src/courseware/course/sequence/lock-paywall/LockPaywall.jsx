import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Alert, Hyperlink, breakpoints, useWindowSize,
} from '@edx/paragon';
import { Locked } from '@edx/paragon/icons';
import SidebarContext from '../../sidebar/SidebarContext';
import messages from './messages';
import certificateLocked from '../../../../generic/assets/edX_locked_certificate.png';
import { useModel } from '../../../../generic/model-store';
import { UpgradeButton } from '../../../../generic/upgrade-button';
import {
  VerifiedCertBullet,
  UnlockGradedBullet,
  FullAccessBullet,
  SupportMissionBullet,
} from '../../../../generic/upsell-bullets/UpsellBullets';

function LockPaywall({
  intl,
  courseId,
}) {
  const { notificationTrayVisible } = useContext(SidebarContext);
  const course = useModel('coursewareMeta', courseId);
  const {
    accessExpiration,
    marketingUrl,
    offer,
  } = course;

  const {
    org, verifiedMode,
  } = useModel('courseHomeMeta', courseId);

  // the following variables are set and used for resposive layout to work with
  // whether the NotificationTray is open or not and if there's an offer with longer text
  const shouldDisplayBulletPointsBelowCertificate = useWindowSize().width <= breakpoints.large.minWidth;
  const shouldDisplayGatedContentOneColumn = useWindowSize().width <= breakpoints.extraLarge.minWidth
    && notificationTrayVisible;
  const shouldDisplayGatedContentTwoColumns = useWindowSize().width < breakpoints.large.minWidth
    && notificationTrayVisible;
  const shouldDisplayGatedContentTwoColumnsHalf = useWindowSize().width <= breakpoints.large.minWidth
    && !notificationTrayVisible;
  const shouldWrapTextOnButton = useWindowSize().width > breakpoints.extraSmall.minWidth;

  const accessExpirationDate = accessExpiration ? new Date(accessExpiration.expirationDate) : null;
  const pastExpirationDeadline = accessExpiration ? new Date(Date.now()) > accessExpirationDate : false;

  if (!verifiedMode) {
    return null;
  }

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const logClick = () => {
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      ...eventProperties,
      linkCategory: '(none)',
      linkName: 'in_course_upgrade',
      linkType: 'link',
      pageName: 'in_course',
    });
  };

  const logClickPastExpiration = () => {
    sendTrackEvent('edx.bi.ecommerce.gated_content.past_expiration.link_clicked', {
      ...eventProperties,
      linkCategory: 'gated_content',
      linkName: 'course_details',
      linkType: 'link',
      pageName: 'in_course',
    });
  };

  return (
    <Alert variant="light" aria-live="off" icon={Locked} className="lock-paywall-container">
      <div className="row">
        <div className="col">
          <h4 aria-level="3">
            <span>{intl.formatMessage(messages['learn.lockPaywall.title'])}</span>
          </h4>
          {pastExpirationDeadline ? (
            <div className="mb-2 upgrade-intro">
              {intl.formatMessage(messages['learn.lockPaywall.content.pastExpiration'])}
              <Hyperlink destination={marketingUrl} onClick={logClickPastExpiration} target="_blank">{intl.formatMessage(messages['learn.lockPaywall.courseDetails'])}</Hyperlink>
            </div>
          ) : (
            <div className="mb-2 upgrade-intro">
              {intl.formatMessage(messages['learn.lockPaywall.content'])}
            </div>
          )}

          <div className={classNames('d-inline-flex flex-row', { 'flex-wrap': notificationTrayVisible || shouldDisplayBulletPointsBelowCertificate })}>
            <div style={{ float: 'left' }} className="mr-3 mb-2">
              <img
                alt={intl.formatMessage(messages['learn.lockPaywall.example.alt'])}
                src={certificateLocked}
                className="border-0 certificate-image-banner"
                style={{ height: '128px', width: '175px' }}
              />
            </div>

            <div className="mw-xs list-div">
              <div className="mb-2">
                {intl.formatMessage(messages['learn.lockPaywall.list.intro'])}
              </div>
              <ul className="fa-ul ml-4 pl-2">
                <VerifiedCertBullet />
                <UnlockGradedBullet />
                <FullAccessBullet />
                <SupportMissionBullet />
              </ul>
            </div>
          </div>
        </div>

        {pastExpirationDeadline
          ? null
          : (
            <div
              className={
                classNames('d-md-flex align-items-md-center text-right', {
                  'col-md-5 mx-md-0': notificationTrayVisible, 'col-md-4 mx-md-3 justify-content-center': !notificationTrayVisible && !shouldDisplayGatedContentTwoColumnsHalf, 'col-md-11 justify-content-end': shouldDisplayGatedContentOneColumn && !shouldDisplayGatedContentTwoColumns, 'col-md-6 justify-content-center': shouldDisplayGatedContentTwoColumnsHalf,
                })
              }
            >
              <UpgradeButton
                offer={offer}
                onClick={logClick}
                verifiedMode={verifiedMode}
                style={{ whiteSpace: shouldWrapTextOnButton ? 'nowrap' : null }}
              />
            </div>
          )}
      </div>
    </Alert>
  );
}
LockPaywall.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};
export default injectIntl(LockPaywall);
