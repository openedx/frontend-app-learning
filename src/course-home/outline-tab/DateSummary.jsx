import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { FormattedDate } from '@edx/frontend-platform/i18n';
import React from 'react';
import PropTypes from 'prop-types';
import { isLearnerAssignment } from '../dates-tab/utils';
import './DateSummary.scss';

export default function DateSummary({
  dateBlock,
  userTimezone,
  /** [MM-P2P] Experiment */
  mmp2p,
}) {
  const linkedTitle = dateBlock.link && isLearnerAssignment(dateBlock);
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  /** [MM-P2P] Experiment */
  const showMMP2P = mmp2p.state.isEnabled && (dateBlock.dateType === 'verified-upgrade-deadline');

  return (
    <li className="container p-0 mb-3 small text-dark-500">
      <div className="row">
        <FontAwesomeIcon icon={faCalendarAlt} className="ml-3 mt-1 mr-1" fixedWidth />
        <div className="ml-1 font-weight-bold">
          <FormattedDate
            value={showMMP2P ? mmp2p.state.upgradeDeadline : dateBlock.date}
            day="numeric"
            month="short"
            weekday="short"
            year="numeric"
            {...timezoneFormatArgs}
          />
        </div>
      </div>
      {/** [MM-P2P] Experiment (conditional) */}
      { showMMP2P ? (
        <div className="row ml-4 pr-2">
          <div className="date-summary-text">
            <div className="font-weight-bold mt-2">
              Last chance to upgrade
            </div>
          </div>
          <div className="date-summary-text mt-1">
            Don&apos;t miss the opportunity to highlight your knowledge and skills by earning a verified certificate.
          </div>
          <a href={dateBlock.link} className="description-link">
            {dateBlock.linkText}
          </a>
        </div>
      ) : (
        <div className="row ml-4 pr-2">
          <div className="date-summary-text">
            {linkedTitle
            && <div className="font-weight-bold mt-2"><a href={dateBlock.link}>{dateBlock.title}</a></div>}
            {!linkedTitle
            && <div className="font-weight-bold mt-2">{dateBlock.title}</div>}
          </div>
          {dateBlock.description
            && <div className="date-summary-text mt-1">{dateBlock.description}</div>}
          {!linkedTitle && dateBlock.link
            && <a href={dateBlock.link} className="description-link">{dateBlock.linkText}</a>}
        </div>
      )}
    </li>
  );
}

DateSummary.propTypes = {
  dateBlock: PropTypes.shape({
    date: PropTypes.string.isRequired,
    dateType: PropTypes.string,
    description: PropTypes.string,
    link: PropTypes.string,
    linkText: PropTypes.string,
    title: PropTypes.string.isRequired,
    learnerHasAccess: PropTypes.bool,
  }).isRequired,
  userTimezone: PropTypes.string,
  /** [MM-P2P] Experiment */
  mmp2p: PropTypes.shape({
    state: PropTypes.shape({
      isEnabled: PropTypes.bool.isRequired,
      upgradeDeadline: PropTypes.string,
    }),
  }),
};

DateSummary.defaultProps = {
  userTimezone: null,
  mmp2p: {
    state: {
      isEnabled: false,
      upgradeDeadline: '',
    },
  },
};
