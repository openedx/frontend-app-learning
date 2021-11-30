/* eslint-disable no-use-before-define */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const AlertBanner = ({ color, children }) => (
  <div
    className={classNames(
      'mmp2p-sidecard-alert alert',
      { danger: color === 'red' },
    )}
  >
    {children}
  </div>
);
AlertBanner.propTypes = {
  color: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const localizeTime = (date) => date.toLocaleTimeString('en-US',
  {
    hour: '2-digit', minute: 'numeric', hour12: true, timeZoneName: 'short',
  });
const localizeDate = (date) => date.toLocaleDateString('en-US',
  { month: 'long', day: 'numeric' });

const BulletList = ({ children }) => (
  <div style={{ marginBottom: '3px' }} className="mmp2p-bullet-list-item">
    <div className="icon-container">
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="far"
        data-icon="check-circle"
        className="svg-inline--fa fa-check-circle fa-w-16"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"
        />
      </svg>
    </div>
    <div className="bullet-item-content">
      {children}
    </div>
  </div>
);
BulletList.propTypes = {
  children: PropTypes.node.isRequired,
};

const Sidecard = ({
  options: {
    state: { upgradeDeadline },
    access: { accessExpirationDate, price, upgradeUrl },
  },
}) => {
  const dates = {
    upgradeDeadline: new Date(upgradeDeadline),
    accessExpirationDate: new Date(accessExpirationDate),
    now: new Date(),
  };
  const upgradeDeadlineTime = localizeTime(dates.upgradeDeadline);
  const upgradeDeadlineDate = localizeDate(dates.upgradeDeadline);
  const daysUntilDeadline = parseInt((dates.upgradeDeadline - dates.now) / (1000 * 60 * 60 * 24), 10);
  const hoursUntilDeadline = parseInt((dates.upgradeDeadline - dates.now) / (1000 * 60 * 60), 10);

  const accessDeadlineDate = localizeDate(dates.accessExpirationDate);

  const certLink = (
    <span className="cert-link">
      <a
        id="mmp2p-support-link"
        href="https://www.edx.org/verified-certificate"
        target="_blank"
        rel="noopener noreferrer"
      >
        verified certificate
      </a>
    </span>
  );

  return (
    <div className="mmp2p-sidecard-wrapper section">
      <h5 className="hd hd-6">
        Unlock the full course by {upgradeDeadlineDate} at {upgradeDeadlineTime}
      </h5>

      <AlertBanner color={daysUntilDeadline >= 7 ? 'yellow' : 'red'}>
        {(daysUntilDeadline > 1) && `${daysUntilDeadline} days left`}
        {(daysUntilDeadline === 1) && '1 day left'}
        {(daysUntilDeadline < 1 && hoursUntilDeadline >= 1) && `${hoursUntilDeadline} hours left`}
        {(daysUntilDeadline < 1 && hoursUntilDeadline < 1) && 'Less than one hour left'}
      </AlertBanner>

      <div style={{ fontSize: '14px' }}>
        <BulletList>
          Unlock your access to all course activities, including
          &nbsp;<span style={{ fontWeight: 600 }}>graded assignments</span>
        </BulletList>
        <BulletList>
          Earn a {certLink} of completion to showcase on your resumé
        </BulletList>
        <BulletList>
          Support our <span style={{ fontWeight: 600 }}>mission</span> at edX
        </BulletList>
      </div>

      <div style={{ fontSize: '12px', marginTop: '10px', marginBottom: '5px' }}>
        You will lose access to the first two weeks of scheduled content on {accessDeadlineDate}.
      </div>

      <div
        className="upgrade-container"
        style={{ paddingTop: '15px' }}
      >
        <a
          id="green_upgrade"
          className="btn btn-primary btn-block btn-lg"
          href={upgradeUrl}
          data-creative="sidebarupsell"
          data-position="sidebar-message"
          data-ol-has-click-handler=""
          style={{ display: 'block', fontSize: '1em', fontWeight: 600 }}
        >
          Upgrade for <span className="price">{price}</span>
        </a>
      </div>
    </div>
  );
};

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

const futureDate = (numDays) => {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + numDays);
  return defaultDate;
};

Sidecard.defaultProps = {
  options: {
    state: {
      upgradeDeadline: new Date('Mar 29, 2021 11:59 PM EST'),
    },
    access: {
      accessDeadline: futureDate(24),
      price: '$23',
      upgradeUrl: '',
    },
  },
};

export default Sidecard;
