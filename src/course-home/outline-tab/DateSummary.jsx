import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { FormattedDate } from '@edx/frontend-platform/i18n';
import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useModel } from '../../generic/model-store';
import { isLearnerAssignment } from '../dates-tab/utils';
import './DateSummary.scss';

export default function DateSummary({
  dateBlock,
  userTimezone,
  /** [MM-P2P] Experiment */
  mmp2p,
}) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    org,
  } = useModel('courseHomeMeta', courseId);

  const linkedTitle = dateBlock.link && isLearnerAssignment(dateBlock);
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  /** [MM-P2P] Experiment */
  const showMMP2P = mmp2p.state.isEnabled && (dateBlock.dateType === 'verified-upgrade-deadline');

  const logVerifiedUpgradeClick = () => {
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      org_key: org,
      courserun_key: courseId,
      linkCategory: '(none)',
      linkName: 'course_home_dates',
      linkType: 'link',
      pageName: 'course_home',
    });
  };

  return (
    <li className="p-0 mb-3 small text-dark-500">
      <div className="row">
        <FontAwesomeIcon icon={faCalendarAlt} className="ml-3 mt-1 mr-1" fixedWidth />
        <div className="ml-1 font-weight-bold">
          <FormattedDate
            /** [MM-P2P] Experiment */
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
            You are still eligible to upgrade to a Verified Certificate!
            &nbsp; Unlock full course access and highlight the knowledge you&apos;ll gain.
          </div>
        </div>
      ) : (
        <div className="row ml-4 pr-2">
          <div className="date-summary-text">
            {linkedTitle && (
              <div className="font-weight-bold mt-2">
                <a href={dateBlock.link}>{dateBlock.title}</a>
              </div>
            )}
            {!linkedTitle && (
              <div className="font-weight-bold mt-2">{dateBlock.title}</div>
            )}
          </div>
          {dateBlock.description && (
            <div className="date-summary-text mt-1">{dateBlock.description}</div>
          )}
          {!linkedTitle && dateBlock.link && (
            <a
              href={dateBlock.link}
              onClick={dateBlock.dateType === 'verified-upgrade-deadline' ? logVerifiedUpgradeClick : () => {}}
              className="description-link"
            >
              {dateBlock.linkText}
            </a>
          )}
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
  /** [MM-P2P] Experiment */
  mmp2p: {
    state: {
      isEnabled: false,
      upgradeDeadline: '',
    },
  },
};
