import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { FormattedDate, sendTrackEvent } from '@openedx/frontend-base';
import React from 'react';
import PropTypes from 'prop-types';
import { useCourseHomeMeta } from '../data/apiHooks';
import { isLearnerAssignment } from '../dates-tab/utils';
import { useCourseId } from '@src/generic/course-params';

const DateSummary = ({
  dateBlock,
  userTimezone,
}) => {
  const courseId = useCourseId();
  const org = useCourseHomeMeta(courseId, { enabled: false }).data?.org;

  const linkedTitle = dateBlock.link && isLearnerAssignment(dateBlock);
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

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
            value={dateBlock.date}
            day="numeric"
            month="short"
            weekday="short"
            year="numeric"
            {...timezoneFormatArgs}
          />
        </div>
      </div>
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
            id={dateBlock.dateType === 'verified-upgrade-deadline' ? 'date-verified-upgrade-deadline' : ''}
            href={dateBlock.link}
            onClick={dateBlock.dateType === 'verified-upgrade-deadline' ? logVerifiedUpgradeClick : () => {}}
            className="description-link"
          >
            {dateBlock.linkText}
          </a>
        )}
      </div>
    </li>
  );
};

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
};

export default DateSummary;
