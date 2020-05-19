import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { FormattedDate, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

import { useModel } from '../model-store';

import Badge from './Badge';
import messages from './messages';
import { daycmp, isLearnerAssignment } from './utils';

import './Day.scss';

function Day({
  date, first, hasDueNextAssignment, intl, items, last,
}) {
  const {
    courseId,
  } = useSelector(state => state.courseware);

  const {
    userTimezone,
  } = useModel('dates', courseId);

  const now = new Date();
  const learnerHasAccess = items.every(x => x.learnerHasAccess);
  const assignments = items.filter(isLearnerAssignment);
  const isComplete = assignments.length && assignments.every(x => x.complete);
  const isPastDue = assignments.some(x => !x.complete && new Date(x.date) < now);
  const unreleased = assignments.some(x => !x.link);
  const isInFuture = daycmp(date, now) > 0;
  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  // This badge info list is in order of priority (they will appear left to right in this order and the first badge
  // sets the color of the dot in the timeline).
  const badgesInfo = [
    {
      message: messages.today,
      shown: daycmp(date, now) === 0,
      bg: 'dates-bg-today',
    },
    {
      message: messages.completed,
      shown: isComplete,
      bg: 'bg-dark-100',
    },
    {
      message: messages.pastDue,
      shown: isPastDue,
      bg: 'bg-dark-200',
    },
    {
      message: messages.dueNext,
      shown: hasDueNextAssignment,
      bg: 'bg-gray-500',
      className: 'text-white',
    },
    {
      message: messages.unreleased,
      shown: unreleased,
      className: 'border border-dark-200 text-gray-500',
    },
    {
      message: messages.verifiedOnly,
      shown: !learnerHasAccess,
      icon: faLock,
      bg: 'bg-dark-500',
      className: 'text-white',
    },
  ];
  let dotColor = null;
  const badges = (
    <>
      {badgesInfo.map(b => {
        if (b.shown) {
          if (!dotColor && !isInFuture) {
            dotColor = b.bg;
          }
          return (
            <Badge key={b.message.id} className={classNames(b.bg, b.className)}>
              {b.icon && <FontAwesomeIcon icon={b.icon} className="mr-1" />}
              {intl.formatMessage(b.message)}
            </Badge>
          );
        }
        return null;
      })}
    </>
  );
  if (!dotColor && isInFuture) {
    dotColor = 'bg-gray-900';
  }

  return (
    <div className="dates-day pb-4">
      {/* Top Line */}
      {!first && <div className="dates-line-top border border-left border-gray-900" />}

      {/* Dot */}
      <div className={classNames(dotColor, 'dates-dot border border-gray-900')} />

      {/* Bottom Line */}
      {!last && <div className="dates-line-bottom border border-left border-gray-900" />}

      {/* Content */}
      <div className="d-inline-block ml-3 pl-3">
        <div>
          <h5 className="d-inline text-dark-500">
            <FormattedDate
              value={date}
              day="numeric"
              month="short"
              weekday="short"
              year="numeric"
              {...timezoneFormatArgs}
            />
          </h5>
          {badges}
        </div>
        {items.map((item) => {
          const showLink = item.link && isLearnerAssignment(item);
          const title = showLink ? (<u><a href={item.link} className="text-reset">{item.title}</a></u>) : item.title;
          const available = item.learnerHasAccess && (item.link || !isLearnerAssignment(item));
          const textColor = available ? 'text-dark-500' : 'text-dark-200';
          return (
            <div key={item.title + item.date} className={textColor}>
              <div className="font-weight-bold">{title}</div>
              <div>{item.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Day.propTypes = {
  date: PropTypes.objectOf(Date).isRequired,
  first: PropTypes.bool,
  hasDueNextAssignment: PropTypes.bool,
  intl: intlShape.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    dateType: PropTypes.string,
    description: PropTypes.string,
    learnerHasAccess: PropTypes.bool,
    link: PropTypes.string,
    title: PropTypes.string,
  })).isRequired,
  last: PropTypes.bool,
};

Day.defaultProps = {
  first: false,
  hasDueNextAssignment: false,
  last: false,
};

export default injectIntl(Day);
