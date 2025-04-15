import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import {
  FormattedDate,
  FormattedTime,
  useIntl,
} from '@edx/frontend-platform/i18n';
import { Tooltip, OverlayTrigger } from '@openedx/paragon';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useModel } from '../../../generic/model-store';

import { getBadgeListAndColor } from './badgelist';
import { isLearnerAssignment } from '../utils';

const Day = ({
  date,
  first,
  items,
  last,
}) => {
  const intl = useIntl();
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const {
    userTimezone,
  } = useModel('courseHomeMeta', courseId);

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  const { color, badges } = getBadgeListAndColor(date, intl, null, items);

  return (
    <li className="dates-day pb-4" data-testid="dates-day">
      {/* Top Line */}
      {!first && <div className="dates-line-top border-1 border-left border-gray-900 bg-gray-900" />}

      {/* Dot */}
      <div className={classNames(color, 'dates-dot border border-gray-900')} />

      {/* Bottom Line */}
      {!last && <div className="dates-line-bottom border-1 border-left border-gray-900 bg-gray-900" />}

      {/* Content */}
      <div className="d-inline-block ml-3 pl-2">
        <div className="row w-100 m-0 mb-1 align-items-center text-primary-700" data-testid="dates-header">
          <FormattedDate
            value={date}
            day="numeric"
            month="short"
            weekday="short"
            year="numeric"
            {...timezoneFormatArgs}
          />
          {badges}
        </div>
        {items.map((item) => {
          const { badges: itemBadges } = getBadgeListAndColor(date, intl, item, items);

          const showDueDateTime = item.dateType === 'assignment-due-date';
          const showLink = item.link && isLearnerAssignment(item);
          const title = showLink ? (<u><a href={item.link} className="text-reset">{item.title}</a></u>) : item.title;
          const available = item.learnerHasAccess && (item.link || !isLearnerAssignment(item));
          const textColor = available ? 'text-primary-700' : 'text-gray-500';

          return (
            <div key={item.title + item.date} className={classNames(textColor, 'small pb-1')} data-testid="dates-item">
              <div>
                <span className="small">
                  <span className="font-weight-bold">{item.assignmentType && `${item.assignmentType}: `}{title}</span>
                  {showDueDateTime && (
                    <span>
                      <span className="mx-1">due</span>
                      <FormattedTime
                        value={date}
                        timeZoneName="short"
                        {...timezoneFormatArgs}
                      />
                    </span>
                  )}
                </span>
                {itemBadges}
                {item.extraInfo && (
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip>{item.extraInfo}</Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="fa-xs ml-1 text-gray-700" data-testid="dates-extra-info" />
                  </OverlayTrigger>
                )}
              </div>
              {item.description && <div className="small mb-2">{item.description}</div>}
            </div>
          );
        })}
      </div>
    </li>
  );
};

Day.propTypes = {
  date: PropTypes.objectOf(Date).isRequired,
  first: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    dateType: PropTypes.string,
    description: PropTypes.string,
    dueNext: PropTypes.bool,
    learnerHasAccess: PropTypes.bool,
    link: PropTypes.string,
    title: PropTypes.string,
  })).isRequired,
  last: PropTypes.bool,
};

Day.defaultProps = {
  first: false,
  last: false,
};

export default Day;
