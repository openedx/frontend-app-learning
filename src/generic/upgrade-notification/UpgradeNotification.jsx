import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { FormattedDate, FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { UpgradeButton } from '../upgrade-button';

function UpsellNoFBECardContent() {
  const verifiedCertLink = (
    <a className="inline-link-underline font-weight-bold" rel="noopener noreferrer" target="_blank" href={`${getConfig().MARKETING_SITE_BASE_URL}/verified-certificate`}>
      <FormattedMessage
        id="learning.generic.upgradeNotification.verifiedCertLink"
        defaultMessage="verified certificate"
      />
    </a>
  );

  return (
    <ul className="fa-ul upgrade-notification-ul pt-0">
      <li>
        <span className="fa-li upgrade-notification-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.generic.upgradeNotification.verifiedCertMessage"
          defaultMessage="Earn a {verifiedCertLink} of completion to showcase on your resume"
          values={{ verifiedCertLink }}
        />
      </li>
      <li>
        <span className="fa-li upgrade-notification-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.generic.upgradeNotification.noFBE.nonProfitMission"
          defaultMessage="Support our {nonProfitMission} at edX"
          values={{
            nonProfitMission: (
              <span className="font-weight-bold">non-profit mission</span>
            ),
          }}
        />
      </li>
    </ul>
  );
}

function UpsellFBEFarAwayCardContent() {
  const verifiedCertLink = (
    <a className="inline-link-underline font-weight-bold" rel="noopener noreferrer" target="_blank" href={`${getConfig().MARKETING_SITE_BASE_URL}/verified-certificate`}>
      <FormattedMessage
        id="learning.generic.upgradeNotification.verifiedCertLink"
        defaultMessage="verified certificate"
      />
    </a>
  );

  const gradedAssignments = (
    <span className="font-weight-bold">
      <FormattedMessage
        id="learning.generic.upgradeNotification.gradedAssignments"
        defaultMessage="graded assignments"
      />
    </span>
  );

  const fullAccess = (
    <span className="font-weight-bold">
      <FormattedMessage
        id="learning.generic.upgradeNotification.verifiedCertLink.fullAccess"
        defaultMessage="Full access"
      />
    </span>
  );

  const nonProfitMission = (
    <span className="font-weight-bold">
      <FormattedMessage
        id="learning.generic.upgradeNotification.FBE.nonProfitMission"
        defaultMessage="non-profit mission"
      />
    </span>
  );

  return (
    <ul className="fa-ul upgrade-notification-ul">
      <li>
        <span className="fa-li upgrade-notification-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.generic.upgradeNotification.verifiedCertMessage"
          defaultMessage="Earn a {verifiedCertLink} of completion to showcase on your resume"
          values={{ verifiedCertLink }}
        />
      </li>
      <li>
        <span className="fa-li upgrade-notification-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.generic.upgradeNotification.unlockGraded"
          defaultMessage="Unlock your access to all course activities, including {gradedAssignments}"
          values={{ gradedAssignments }}
        />
      </li>
      <li>
        <span className="fa-li upgrade-notification-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.generic.upgradeNotification.fullAccess"
          defaultMessage="{fullAccess} to course content and materials, even after the course ends"
          values={{ fullAccess }}
        />
      </li>
      <li>
        <span className="fa-li upgrade-notification-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.generic.upgradeNotification.nonProfitMission"
          defaultMessage="Support our {nonProfitMission} at edX"
          values={{ nonProfitMission }}
        />
      </li>
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

function ExpirationCountdown({ hoursToExpiration }) {
  let expirationText;

  if (hoursToExpiration >= 24) {
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
  } else if (hoursToExpiration >= 1) {
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
  } else {
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
  hoursToExpiration: PropTypes.number.isRequired,
};

function AccessExpirationDateBanner({ accessExpirationDate, timezoneFormatArgs }) {
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
  accessExpirationDate: PropTypes.PropTypes.instanceOf(Date).isRequired,
  timezoneFormatArgs: PropTypes.shape({
    timeZone: PropTypes.string,
  }),
};

AccessExpirationDateBanner.defaultProps = {
  timezoneFormatArgs: {},
};

function UpgradeNotification({
  accessExpiration,
  contentTypeGatingEnabled,
  courseId,
  offer,
  org,
  timeOffsetMillis,
  userTimezone,
  verifiedMode,
  shouldDisplayBorder,
}) {
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};
  const correctedTime = new Date(Date.now() + timeOffsetMillis);

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
      linkName: 'course_home_green',
      linkType: 'button',
      pageName: 'course_home',
    });
  };

  /*
  There are 4 parts that change in the upgrade card:
    upgradeNotificationHeaderText
    expirationBanner
    upsellMessage
    offerCode
  */
  let upgradeNotificationHeaderText;
  let expirationBanner;
  let upsellMessage;
  let offerCode;

  if (!!accessExpiration && !!contentTypeGatingEnabled) {
    const accessExpirationDate = new Date(accessExpiration.expirationDate);
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
        expirationBanner = <ExpirationCountdown hoursToExpiration={hoursToDiscountExpiration} />;
      } else {
        upgradeNotificationHeaderText = (
          <FormattedMessage
            id="learning.generic.upgradeNotification.accessExpiration"
            defaultMessage="Upgrade your course today"
          />
        );
        expirationBanner = (
          <AccessExpirationDateBanner
            accessExpirationDate={accessExpirationDate}
            timezoneFormatArgs={timezoneFormatArgs}
          />
        );
      }
      upsellMessage = <UpsellFBEFarAwayCardContent />;
    } else { // more urgent messaging if there's less than 7 days left to access expiration
      upgradeNotificationHeaderText = (
        <FormattedMessage
          id="learning.generic.upgradeNotification.accessExpirationUrgent"
          defaultMessage="Course Access Expiration"
        />
      );
      expirationBanner = <ExpirationCountdown hoursToExpiration={hoursToAccessExpiration} />;
      upsellMessage = (
        <UpsellFBESoonCardContent
          accessExpirationDate={accessExpirationDate}
          timezoneFormatArgs={timezoneFormatArgs}
        />
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
      <h2 className="h5 upgrade-notification-header" id="outline-sidebar-upgrade-header">
        {upgradeNotificationHeaderText}
      </h2>
      {expirationBanner}
      <div className="upgrade-notification-message">
        {upsellMessage}
      </div>
      <UpgradeButton
        offer={offer}
        onClick={logClick}
        verifiedMode={verifiedMode}
        className="upgrade-notification-button"
        block
      />
      {offerCode}
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
  offer: PropTypes.shape({
    expirationDate: PropTypes.string,
    percentage: PropTypes.number,
    code: PropTypes.string,
  }),
  timeOffsetMillis: PropTypes.number,
  userTimezone: PropTypes.string,
  verifiedMode: PropTypes.shape({
    currencySymbol: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    upgradeUrl: PropTypes.string.isRequired,
  }),
  shouldDisplayBorder: PropTypes.bool,
};

UpgradeNotification.defaultProps = {
  accessExpiration: null,
  contentTypeGatingEnabled: false,
  offer: null,
  timeOffsetMillis: 0,
  userTimezone: null,
  verifiedMode: null,
  shouldDisplayBorder: null,
};

export default injectIntl(UpgradeNotification);
