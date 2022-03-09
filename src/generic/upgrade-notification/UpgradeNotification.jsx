import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { FormattedDate, FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { setLocalStorage } from '../../data/localStorage';
import { UpgradeButton } from '../upgrade-button';
import {
  VerifiedCertBullet,
  UnlockGradedBullet,
  FullAccessBullet,
  SupportMissionBullet,
} from '../upsell-bullets/UpsellBullets';

function UpsellNoFBECardContent() {
  return (
    <ul className="fa-ul upgrade-notification-ul pt-0">
      <VerifiedCertBullet />
      <SupportMissionBullet />
    </ul>
  );
}

function UpsellFBEFarAwayCardContent() {
  return (
    <ul className="fa-ul upgrade-notification-ul">
      <VerifiedCertBullet />
      <UnlockGradedBullet />
      <FullAccessBullet />
      <SupportMissionBullet />
    </ul>
  );
}

function UpsellFBESoonCardContent({ accessExpirationDate, timezoneFormatArgs }) {
  const includingAnyProgress = (
    <span className="font-weight-bold">
      <FormattedMessage
        id="learning.generic.upgradeNotification.expirationAccessLoss.progress"
        defaultMessage="including any progress"
      />
    </span>
  );

  const date = (
    <FormattedDate
      key="accessDate"
      day="numeric"
      month="long"
      value={new Date(accessExpirationDate)}
      {...timezoneFormatArgs}
    />
  );

  const benefitsOfUpgrading = (
    <a className="inline-link-underline font-weight-bold" rel="noopener noreferrer" target="_blank" href="https://support.edx.org/hc/en-us/articles/360013426573-What-are-the-differences-between-audit-free-and-verified-paid-courses-">
      <FormattedMessage
        id="learning.generic.upgradeNotification.expirationVerifiedCert.benefits"
        defaultMessage="benefits of upgrading"
      />
    </a>
  );

  return (
    <div className="upgrade-notification-text">
      <p>
        <FormattedMessage
          id="learning.generic.upgradeNotification.expirationAccessLoss"
          defaultMessage="You will lose all access to this course, {includingAnyProgress}, on {date}."
          values={{
            includingAnyProgress,
            date,
          }}
        />
      </p>
      <p>
        <FormattedMessage
          id="learning.generic.upgradeNotification.expirationVerifiedCert"
          defaultMessage="Upgrading your course enables you to pursue a verified certificate and unlocks numerous features. Learn more about the {benefitsOfUpgrading}."
          values={{ benefitsOfUpgrading }}
        />
      </p>
    </div>
  );
}

UpsellFBESoonCardContent.propTypes = {
  accessExpirationDate: PropTypes.PropTypes.instanceOf(Date).isRequired,
  timezoneFormatArgs: PropTypes.shape({
    timeZone: PropTypes.string,
  }),
};

UpsellFBESoonCardContent.defaultProps = {
  timezoneFormatArgs: {},
};

function PastExpirationCardContent() {
  return (
    <div className="upgrade-notification-text">
      <p>
        <FormattedMessage
          id="learning.generic.upgradeNotification.pastExpiration.content"
          defaultMessage="The upgrade deadline for this course passed. To upgrade, enroll in the next available session."
        />
      </p>
    </div>
  );
}

function ExpirationCountdown({
  courseId, hoursToExpiration, setupgradeNotificationCurrentState, type,
}) {
  let expirationText;
  if (hoursToExpiration >= 24) { // More than 1 day left
    // setupgradeNotificationCurrentState is available in NotificationTray (not course home)
    if (setupgradeNotificationCurrentState) {
      if (type === 'access') {
        setupgradeNotificationCurrentState('accessDaysLeft');
        setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'accessDaysLeft');
      }
      if (type === 'offer') {
        setupgradeNotificationCurrentState('FPDdaysLeft');
        setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'FPDdaysLeft');
      }
    }
    expirationText = (
      <FormattedMessage
        id="learning.generic.upgradeNotification.expirationDays"
        defaultMessage={`{dayCount, number} {dayCount, plural, 
          one {day}
          other {days}} left`}
        values={{
          dayCount: (Math.floor(hoursToExpiration / 24)),
        }}
      />
    );
  } else if (hoursToExpiration >= 1) { // More than 1 hour left
    // setupgradeNotificationCurrentState is available in NotificationTray (not course home)
    if (setupgradeNotificationCurrentState) {
      if (type === 'access') {
        setupgradeNotificationCurrentState('accessHoursLeft');
        setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'accessHoursLeft');
      }
      if (type === 'offer') {
        setupgradeNotificationCurrentState('FPDHoursLeft');
        setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'FPDHoursLeft');
      }
    }
    expirationText = (
      <FormattedMessage
        id="learning.generic.upgradeNotification.expirationHours"
        defaultMessage={`{hourCount, number} {hourCount, plural,
          one {hour}
          other {hours}} left`}
        values={{
          hourCount: (hoursToExpiration),
        }}
      />
    );
  } else { // Less than 1 hour
    // setupgradeNotificationCurrentState is available in NotificationTray (not course home)
    if (setupgradeNotificationCurrentState) {
      if (type === 'access') {
        setupgradeNotificationCurrentState('accessLastHour');
        setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'accessLastHour');
      }
      if (type === 'offer') {
        setupgradeNotificationCurrentState('FPDLastHour');
        setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'FPDLastHour');
      }
    }
    expirationText = (
      <FormattedMessage
        id="learning.generic.upgradeNotification.expirationMinutes"
        defaultMessage="Less than 1 hour left"
      />
    );
  }
  return (<div className="upsell-warning">{expirationText}</div>);
}

ExpirationCountdown.propTypes = {
  courseId: PropTypes.string.isRequired,
  hoursToExpiration: PropTypes.number.isRequired,
  setupgradeNotificationCurrentState: PropTypes.func,
  type: PropTypes.string,
};
ExpirationCountdown.defaultProps = {
  setupgradeNotificationCurrentState: null,
  type: null,
};

function AccessExpirationDateBanner({
  courseId, accessExpirationDate, timezoneFormatArgs, setupgradeNotificationCurrentState,
}) {
  if (setupgradeNotificationCurrentState) {
    setupgradeNotificationCurrentState('accessDateView');
    setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'accessDateView');
  }
  return (
    <div className="upsell-warning-light">
      <FormattedMessage
        id="learning.generic.upgradeNotification.expiration"
        defaultMessage="Course access will expire {date}"
        values={{
          date: (
            <FormattedDate
              key="accessExpireDate"
              day="numeric"
              month="long"
              value={accessExpirationDate}
              {...timezoneFormatArgs}
            />
          ),
        }}
      />
    </div>
  );
}

AccessExpirationDateBanner.propTypes = {
  courseId: PropTypes.string.isRequired,
  accessExpirationDate: PropTypes.PropTypes.instanceOf(Date).isRequired,
  timezoneFormatArgs: PropTypes.shape({
    timeZone: PropTypes.string,
  }),
  setupgradeNotificationCurrentState: PropTypes.func,
};

AccessExpirationDateBanner.defaultProps = {
  timezoneFormatArgs: {},
  setupgradeNotificationCurrentState: null,
};

function PastExpirationDateBanner({
  courseId, accessExpirationDate, timezoneFormatArgs, setupgradeNotificationCurrentState,
}) {
  if (setupgradeNotificationCurrentState) {
    setupgradeNotificationCurrentState('PastExpirationDate');
    setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'PastExpirationDate');
  }
  return (
    <div className="upsell-warning">
      <FormattedMessage
        id="learning.generic.upgradeNotification.pastExpiration.banner"
        defaultMessage="Upgrade deadline passed on {date}"
        values={{
          date: (
            <FormattedDate
              key="accessExpireDate"
              day="numeric"
              month="long"
              value={accessExpirationDate}
              {...timezoneFormatArgs}
            />
          ),
        }}
      />
    </div>
  );
}

PastExpirationDateBanner.propTypes = {
  courseId: PropTypes.string.isRequired,
  accessExpirationDate: PropTypes.PropTypes.instanceOf(Date).isRequired,
  timezoneFormatArgs: PropTypes.shape({
    timeZone: PropTypes.string,
  }),
  setupgradeNotificationCurrentState: PropTypes.func,
};

PastExpirationDateBanner.defaultProps = {
  timezoneFormatArgs: {},
  setupgradeNotificationCurrentState: null,
};

function UpgradeNotification({
  accessExpiration,
  contentTypeGatingEnabled,
  marketingUrl,
  courseId,
  offer,
  org,
  setupgradeNotificationCurrentState,
  shouldDisplayBorder,
  timeOffsetMillis,
  upsellPageName,
  userTimezone,
  verifiedMode,
}) {
  const dateNow = Date.now();
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};
  const correctedTime = new Date(dateNow + timeOffsetMillis);
  const accessExpirationDate = accessExpiration ? new Date(accessExpiration.expirationDate) : null;
  const pastExpirationDeadline = accessExpiration ? new Date(dateNow) > accessExpirationDate : false;

  if (!verifiedMode) {
    return null;
  }

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const promotionEventProperties = {
    creative: 'sidebarupsell',
    name: 'In-Course Verification Prompt',
    position: 'sidebar-message',
    promotion_id: 'courseware_verified_certificate_upsell',
    ...eventProperties,
  };

  useEffect(() => {
    sendTrackingLogEvent('edx.bi.course.upgrade.sidebarupsell.displayed', eventProperties);
    sendTrackEvent('Promotion Viewed', promotionEventProperties);
  }, []);

  const logClick = () => {
    sendTrackingLogEvent('edx.bi.course.upgrade.sidebarupsell.clicked', eventProperties);
    sendTrackingLogEvent('edx.course.enrollment.upgrade.clicked', {
      ...eventProperties,
      location: 'sidebar-message',
    });
    sendTrackEvent('Promotion Clicked', promotionEventProperties);
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      ...eventProperties,
      linkCategory: 'green_upgrade',
      linkName: `${upsellPageName}_green`,
      linkType: 'button',
      pageName: upsellPageName,
    });
  };

  const logClickPastExpiration = () => {
    sendTrackEvent('edx.bi.ecommerce.upgrade_notification.past_expiration.button_clicked', {
      ...eventProperties,
      linkCategory: 'upgrade_notification',
      linkName: `${upsellPageName}_course_details`,
      linkType: 'button',
      pageName: upsellPageName,
    });
  };

  /*
  There are 5 parts that change in the upgrade card:
    upgradeNotificationHeaderText
    expirationBanner
    upsellMessage
    callToActionButton
    offerCode
  */
  let upgradeNotificationHeaderText;
  let expirationBanner;
  let upsellMessage;
  let callToActionButton;
  let offerCode;

  if (!!accessExpiration && !!contentTypeGatingEnabled) {
    const hoursToAccessExpiration = Math.floor((accessExpirationDate - correctedTime) / 1000 / 60 / 60);

    if (hoursToAccessExpiration >= (7 * 24)) {
      if (offer) { // countdown to the first purchase discount if there is one
        const hoursToDiscountExpiration = Math.floor((new Date(offer.expirationDate) - correctedTime) / 1000 / 60 / 60);
        upgradeNotificationHeaderText = (
          <FormattedMessage
            id="learning.generic.upgradeNotification.firstTimeLearnerDiscount"
            defaultMessage="{percentage}% First-Time Learner Discount"
            values={{
              percentage: (offer.percentage),
            }}
          />
        );
        expirationBanner = (
          <ExpirationCountdown
            courseId={courseId}
            hoursToExpiration={hoursToDiscountExpiration}
            setupgradeNotificationCurrentState={setupgradeNotificationCurrentState}
            type="offer"
          />
        );
      } else {
        upgradeNotificationHeaderText = (
          <FormattedMessage
            id="learning.generic.upgradeNotification.accessExpiration"
            defaultMessage="Upgrade your course today"
          />
        );
        expirationBanner = (
          <AccessExpirationDateBanner
            courseId={courseId}
            accessExpirationDate={accessExpirationDate}
            timezoneFormatArgs={timezoneFormatArgs}
            setupgradeNotificationCurrentState={setupgradeNotificationCurrentState}
          />
        );
      }
      upsellMessage = <UpsellFBEFarAwayCardContent />;
    } else if (hoursToAccessExpiration < (7 * 24) && hoursToAccessExpiration >= 0) {
      // more urgent messaging if there's less than 7 days left to access expiration
      upgradeNotificationHeaderText = (
        <FormattedMessage
          id="learning.generic.upgradeNotification.accessExpirationUrgent"
          defaultMessage="Course Access Expiration"
        />
      );
      expirationBanner = (
        <ExpirationCountdown
          courseId={courseId}
          hoursToExpiration={hoursToAccessExpiration}
          setupgradeNotificationCurrentState={setupgradeNotificationCurrentState}
          type="access"
        />
      );
      upsellMessage = (
        <UpsellFBESoonCardContent
          accessExpirationDate={accessExpirationDate}
          timezoneFormatArgs={timezoneFormatArgs}
        />
      );
    } else { // access expiration deadline has passed
      upgradeNotificationHeaderText = (
        <FormattedMessage
          id="learning.generic.upgradeNotification.accessExpirationPast"
          defaultMessage="Course Access Expiration"
        />
      );
      expirationBanner = (
        <PastExpirationDateBanner
          courseId={courseId}
          accessExpirationDate={accessExpirationDate}
          timezoneFormatArgs={timezoneFormatArgs}
          setupgradeNotificationCurrentState={setupgradeNotificationCurrentState}
        />
      );
      upsellMessage = (
        <PastExpirationCardContent />
      );
    }
  } else { // FBE is turned off
    upgradeNotificationHeaderText = (
      <FormattedMessage
        id="learning.generic.upgradeNotification.pursueAverifiedCertificate"
        defaultMessage="Pursue a verified certificate"
      />
    );
    upsellMessage = (<UpsellNoFBECardContent />);
  }

  if (pastExpirationDeadline) {
    callToActionButton = (
      <Button
        variant="primary"
        onClick={logClickPastExpiration}
        href={marketingUrl}
        block
      >
        View Course Details
      </Button>
    );
  } else {
    callToActionButton = (
      <UpgradeButton
        offer={offer}
        onClick={logClick}
        verifiedMode={verifiedMode}
        block
      />
    );
  }

  if (offer) { // if there's a first purchase discount, message the code at the bottom
    offerCode = (
      <div className="text-center discount-info">
        <FormattedMessage
          id="learning.generic.upgradeNotification.code"
          defaultMessage="Use code {code} at checkout"
          values={{
            code: (<span className="font-weight-bold">{offer.code}</span>),
          }}
        />
      </div>
    );
  }

  return (
    <section className={classNames('upgrade-notification small', { 'card mb-4': shouldDisplayBorder })}>
      <div id="courseHome-upgradeNotification">
        <h2 className="h5 upgrade-notification-header" id="outline-sidebar-upgrade-header">
          {upgradeNotificationHeaderText}
        </h2>
        {expirationBanner}
        <div className="upgrade-notification-message">
          {upsellMessage}
        </div>
        <div className="upgrade-notification-button">
          {callToActionButton}
        </div>
        {offerCode}
      </div>
    </section>
  );
}

UpgradeNotification.propTypes = {
  courseId: PropTypes.string.isRequired,
  org: PropTypes.string.isRequired,
  accessExpiration: PropTypes.shape({
    expirationDate: PropTypes.string,
  }),
  contentTypeGatingEnabled: PropTypes.bool,
  marketingUrl: PropTypes.string,
  offer: PropTypes.shape({
    expirationDate: PropTypes.string,
    percentage: PropTypes.number,
    code: PropTypes.string,
  }),
  shouldDisplayBorder: PropTypes.bool,
  setupgradeNotificationCurrentState: PropTypes.func,
  timeOffsetMillis: PropTypes.number,
  upsellPageName: PropTypes.string.isRequired,
  userTimezone: PropTypes.string,
  verifiedMode: PropTypes.shape({
    currencySymbol: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    upgradeUrl: PropTypes.string.isRequired,
  }),
};

UpgradeNotification.defaultProps = {
  accessExpiration: null,
  contentTypeGatingEnabled: false,
  marketingUrl: null,
  offer: null,
  setupgradeNotificationCurrentState: null,
  shouldDisplayBorder: null,
  timeOffsetMillis: 0,
  userTimezone: null,
  verifiedMode: null,
};

export default injectIntl(UpgradeNotification);
