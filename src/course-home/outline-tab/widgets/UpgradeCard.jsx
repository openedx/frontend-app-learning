import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { sendTrackEvent, sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { FormattedDate, FormattedMessage, injectIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { UpgradeButton } from '../../../generic/upgrade-button';

function UpsellNoFBECardContent() {
  return (
    <ul className="fa-ul upgrade-card-ul pt-0">
      <li>
        <span className="fa-li upgrade-card-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.outline.alert.upgradecard.verifiedCertLink"
          defaultMessage="Earn a {verifiedCertLink} of completion to showcase on your resume"
          values={{
            verifiedCertLink: (
              <a className="inline-link-underline font-weight-bold" rel="noopener noreferrer" target="_blank" href={`${getConfig().MARKETING_SITE_BASE_URL}/verified-certificate`}>verified certificate</a>
            ),
          }}
        />
      </li>
      <li>
        <span className="fa-li upgrade-card-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.outline.alert.upgradecard.nonProfitMission"
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
  return (
    <ul className="fa-ul upgrade-card-ul">
      <li>
        <span className="fa-li upgrade-card-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.outline.alert.upgradecard.verifiedCertLink"
          defaultMessage="Earn a {verifiedCertLink} of completion to showcase on your resume"
          values={{
            verifiedCertLink: (
              <a className="inline-link-underline font-weight-bold" rel="noopener noreferrer" target="_blank" href={`${getConfig().MARKETING_SITE_BASE_URL}/verified-certificate`}>verified certificate</a>
            ),
          }}
        />
      </li>
      <li>
        <span className="fa-li upgrade-card-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.outline.alert.upgradecard.unlock-graded"
          defaultMessage="Unlock your access to all course activities, including {gradedAssignments}"
          values={{
            gradedAssignments: (
              <span className="font-weight-bold">graded assignments</span>
            ),
          }}
        />
      </li>
      <li>
        <span className="fa-li upgrade-card-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.outline.alert.upgradecard.fullAccess"
          defaultMessage="{fullAccess} to course content and materials, even after the course ends"
          values={{
            fullAccess: (
              <span className="font-weight-bold">Full access</span>
            ),
          }}
        />
      </li>
      <li>
        <span className="fa-li upgrade-card-li"><FontAwesomeIcon icon={faCheck} /></span>
        <FormattedMessage
          id="learning.outline.alert.upgradecard.nonProfitMission"
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

function UpsellFBESoonCardContent({ accessExpirationDate, timezoneFormatArgs }) {
  return (
    <div>
      <p>
        <FormattedMessage
          id="learning.outline.alert.upgradecard.expirationAccessLoss"
          defaultMessage="You will lose all access to this course, {includingAnyProgress}, on {date}."
          values={{
            includingAnyProgress: (<span className="font-weight-bold">including any progress</span>),
            date: (
              <FormattedDate
                key="accessDate"
                day="numeric"
                month="long"
                value={new Date(accessExpirationDate)}
                {...timezoneFormatArgs}
              />
            ),
          }}
        />
      </p>
      <p>
        <FormattedMessage
          id="learning.outline.alert.upgradecard.expirationVerifiedCert"
          defaultMessage="Upgrading your course enables you to pursue a verified certificate and unlocks numerous features. Learn more about the {benefitsOfUpgrading}."
          values={{
            benefitsOfUpgrading: (<a className="inline-link-underline font-weight-bold" rel="noopener noreferrer" target="_blank" href="https://support.edx.org/hc/en-us/articles/360013426573-What-are-the-differences-between-audit-free-and-verified-paid-courses-">benefits of upgrading</a>),
          }}
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
        id="learning.outline.alert.upgradecard.expiration.days"
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
        id="learning.outline.alert.upgradecard.expiration.hours"
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
        id="learning.outline.alert.upgradecard.expiration.minutes"
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
        id="learning.outline.alert.upgradecard.expirationr"
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

function UpgradeCard({
  accessExpiration,
  contentTypeGatingEnabled,
  courseId,
  offer,
  org,
  timeOffsetMillis,
  userTimezone,
  verifiedMode,
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
    upgradeCardHeaderText
    expirationBanner
    upsellMessage
    offerCode
  */
  let upgradeCardHeaderText;
  let expirationBanner;
  let upsellMessage;
  let offerCode;

  if (!!accessExpiration && !!contentTypeGatingEnabled) {
    if (offer) { // if there's a first purchase discount, show it
      const hoursToDiscountExpiration = Math.floor((new Date(offer.expirationDate) - correctedTime) / 1000 / 60 / 60);

      upgradeCardHeaderText = (
        <FormattedMessage
          id="learning.outline.alert.upgradecard.firstTimeLearnerDiscount"
          defaultMessage="{percentage}% First-Time Learner Discount"
          values={{
            percentage: (offer.percentage),
          }}
        />
      );
      expirationBanner = <ExpirationCountdown hoursToExpiration={hoursToDiscountExpiration} />;
      upsellMessage = <UpsellFBEFarAwayCardContent />;
      offerCode = (
        <div className="text-center discount-info">
          <FormattedMessage
            id="learning.outline.alert.upgradecard.code"
            defaultMessage="Use code {code} at checkout"
            values={{
              code: (<span className="font-weight-bold">{offer.code}</span>),
            }}
          />
        </div>
      );
    } else {
      const accessExpirationDate = new Date(accessExpiration.expirationDate);
      const hoursToAccessExpiration = Math.floor((accessExpirationDate - correctedTime) / 1000 / 60 / 60);

      if (hoursToAccessExpiration >= (7 * 24)) {
        upgradeCardHeaderText = (
          <FormattedMessage
            id="learning.outline.alert.upgradecard.accessExpiration"
            defaultMessage="Upgrade your course today"
          />
        );
        expirationBanner = (
          <AccessExpirationDateBanner
            accessExpirationDate={accessExpirationDate}
            timezoneFormatArgs={timezoneFormatArgs}
          />
        );
        upsellMessage = <UpsellFBEFarAwayCardContent />;
      } else { // more urgent messaging if there's less than 7 days left
        upgradeCardHeaderText = (
          <FormattedMessage
            id="learning.outline.alert.upgradecard.accessExpirationUrgent"
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
    }
  } else { // FBE is turned off
    upgradeCardHeaderText = (
      <FormattedMessage
        id="learning.outline.alert.upgradecard.pursueAverifiedCertificate"
        defaultMessage="Pursue a verified certificate"
      />
    );
    upsellMessage = (<UpsellNoFBECardContent />);
  }

  return (
    <section className="mb-4 card upgrade-card small">
      <h2 className="h5 upgrade-card-header" id="outline-sidebar-upgrade-header">
        {upgradeCardHeaderText}
      </h2>
      {expirationBanner}
      <div className="upgrade-card-message">
        {upsellMessage}
      </div>
      <UpgradeButton
        offer={offer}
        onClick={logClick}
        verifiedMode={verifiedMode}
        className="upgrade-card-button"
      />
      {offerCode}
    </section>
  );
}

UpgradeCard.propTypes = {
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
};

UpgradeCard.defaultProps = {
  accessExpiration: null,
  contentTypeGatingEnabled: false,
  offer: null,
  timeOffsetMillis: 0,
  userTimezone: null,
  verifiedMode: null,
};

export default injectIntl(UpgradeCard);
