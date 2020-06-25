import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

import Badge from './Badge';
import messages from './messages';
import { daycmp, isLearnerAssignment } from './utils';

function hasAccess(item) {
  return item.learnerHasAccess;
}

function isComplete(assignment) {
  return assignment.complete;
}

function isPastDue(assignment) {
  return !isComplete(assignment) && (new Date(assignment.date) < new Date());
}

function isUnreleased(assignment) {
  return !assignment.link;
}

// Pass a null item if you want to get a whole day's badge list, not just one item's list.
// Returns an object with 'color' and 'badges' properties.
function getBadgeListAndColor(date, intl, item, items) {
  const now = new Date();
  const assignments = items.filter(isLearnerAssignment);
  const isToday = daycmp(date, now) === 0;
  const isInFuture = daycmp(date, now) > 0;

  // This badge info list is in order of priority (they will appear left to right in this order and the first badge
  // sets the color of the dot in the timeline).
  const badgesInfo = [
    {
      message: messages.today,
      shownForDay: isToday,
      bg: 'dates-bg-today',
    },
    {
      message: messages.completed,
      shownForDay: assignments.length && assignments.every(isComplete),
      shownForItem: x => isLearnerAssignment(x) && isComplete(x),
      bg: 'bg-dark-100',
    },
    {
      message: messages.pastDue,
      shownForDay: assignments.length && assignments.every(isPastDue),
      shownForItem: x => isLearnerAssignment(x) && isPastDue(x),
      bg: 'bg-dark-200',
    },
    {
      message: messages.dueNext,
      shownForDay: !isToday && assignments.some(x => x.dueNext),
      shownForItem: x => x.dueNext,
      bg: 'bg-gray-500',
      className: 'text-white',
    },
    {
      message: messages.unreleased,
      shownForDay: assignments.length && assignments.every(isUnreleased),
      shownForItem: x => isLearnerAssignment(x) && isUnreleased(x),
      className: 'border border-dark-200 text-gray-500 align-top',
    },
    {
      message: messages.verifiedOnly,
      shownForDay: items.length && items.every(x => !hasAccess(x)),
      shownForItem: x => !hasAccess(x),
      icon: faLock,
      bg: 'bg-dark-500',
      className: 'text-white',
    },
  ];
  let color = null; // first color of any badge
  const badges = (
    <>
      {badgesInfo.map(b => {
        let shown = b.shownForDay;
        if (item) {
          if (b.shownForDay) {
            shown = false; // don't double up, if the day already has this badge
          } else {
            shown = b.shownForItem && b.shownForItem(item);
          }
        }
        if (!shown) {
          return null;
        }

        if (!color && !isInFuture) {
          color = b.bg;
        }
        return (
          <Badge key={b.message.id} className={classNames(b.bg, b.className)}>
            {b.icon && <FontAwesomeIcon icon={b.icon} className="mr-1" />}
            {intl.formatMessage(b.message)}
          </Badge>
        );
      })}
    </>
  );
  if (!color && isInFuture) {
    color = 'bg-gray-900';
  }

  return {
    color,
    badges,
  };
}

// eslint-disable-next-line import/prefer-default-export
export { getBadgeListAndColor };
