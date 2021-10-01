import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Alert } from '@edx/paragon';
import { Locked } from '@edx/paragon/icons';
import messages from './messages';
import genericMessages from '../../../../generic/messages';
import certificateLocked from '../../../../generic/assets/edX_locked_certificate.png';
import { useModel } from '../../../../generic/model-store';
import useWindowSize, { responsiveBreakpoints } from '../../../../generic/tabs/useWindowSize';
import { UpgradeButton } from '../../../../generic/upgrade-button';

function LockPaywall({
  intl,
  courseId,
  notificationTrayVisible,
}) {
  const course = useModel('coursewareMeta', courseId);
  const {
    offer,
    org,
    verifiedMode,
  } = course;

  // the following variables are set and used for resposive layout to work with
  // whether the NotificationTray is open or not and if there's an offer with longer text
  const shouldDisplayBulletPointsBelowCertificate = useWindowSize().width
    <= responsiveBreakpoints.large.minWidth;
  const shouldDisplayGatedContentOneColumn = useWindowSize().width <= responsiveBreakpoints.extraLarge.minWidth
    && notificationTrayVisible;
  const shouldDisplayGatedContentTwoColumns = useWindowSize().width < responsiveBreakpoints.large.minWidth
    && notificationTrayVisible;
  const shouldDisplayGatedContentTwoColumnsHalf = useWindowSize().width <= responsiveBreakpoints.large.minWidth
    && !notificationTrayVisible;
  const shouldWrapTextOnButton = useWindowSize().width > responsiveBreakpoints.extraSmall.minWidth;

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

  const verifiedCert = (
    <Alert.Link
      href={`${getConfig().MARKETING_SITE_BASE_URL}/verified-certificate`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {intl.formatMessage(genericMessages['upsell.verifiedCertMessageBullet.verifiedCert'])}
    </Alert.Link>
  );

  const gradedAssignments = (
    <span className="font-weight-bold">
      {intl.formatMessage(genericMessages['upsell.unlockGradedBullet.gradedAssignments'])}
    </span>
  );
  const fullAccess = (
    <span className="font-weight-bold">
      {intl.formatMessage(genericMessages['upsell.fullAccessBullet.fullAccess'])}
    </span>
  );
  const mission = (
    <span className="font-weight-bold">
      {intl.formatMessage(genericMessages['upsell.supportMissionBullet.mission'])}
    </span>
  );

  return (
    <Alert variant="light" aria-live="off" icon={Locked} className="lock-paywall-container">
      <div className="row">
        <div className="col">
          <h4 aria-level="3">
            <span>{intl.formatMessage(messages['learn.lockPaywall.title'])}</span>
          </h4>

          <div className="mb-2 upgrade-intro">
            {intl.formatMessage(messages['learn.lockPaywall.content'])}
          </div>

          <div className={classNames('d-flex flex-row', { 'flex-wrap': notificationTrayVisible || shouldDisplayBulletPointsBelowCertificate })}>
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
                <li>
                  <span className="fa-li"><FontAwesomeIcon icon={faCheck} /></span>
                  {intl.formatMessage(
                    genericMessages['upsell.verifiedCertMessageBullet'],
                    { verifiedCert },
                  )}
                </li>
                <li>
                  <span className="fa-li"><FontAwesomeIcon icon={faCheck} /></span>
                  {intl.formatMessage(
                    genericMessages['upsell.unlockGradedBullet'],
                    { gradedAssignments },
                  )}
                </li>
                <li>
                  <span className="fa-li"><FontAwesomeIcon icon={faCheck} /></span>
                  {intl.formatMessage(
                    genericMessages['upsell.fullAccessBullet'],
                    { fullAccess },
                  )}
                </li>
                <li>
                  <span className="fa-li"><FontAwesomeIcon icon={faCheck} /></span>
                  {intl.formatMessage(
                    genericMessages['upsell.supportMissionBullet'],
                    { mission },
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>

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
      </div>
    </Alert>
  );
}
LockPaywall.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  notificationTrayVisible: PropTypes.bool.isRequired,
};
export default injectIntl(LockPaywall);
