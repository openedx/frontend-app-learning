import React from 'react';
import { useSelector } from 'react-redux';

import { useModel } from '../../../generic/model-store';

import Day from './Day';
import { daycmp, isLearnerAssignment } from '../utils';

const Timeline = () => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    courseDateBlocks,
  } = useModel('dates', courseId);

  // Group date items by day (assuming they are sorted in first place) and add some metadata
  const groupedDates = [];
  const now = new Date();
  let foundNextDue = false;
  let foundToday = false;
  courseDateBlocks.forEach(courseDateBlock => {
    const dateInfo = { ...courseDateBlock };
    const parsedDate = new Date(dateInfo.date);

    if (!foundNextDue && parsedDate >= now && isLearnerAssignment(dateInfo) && !dateInfo.complete) {
      foundNextDue = true;
      dateInfo.dueNext = true;
    }

    if (!foundToday) {
      const compared = daycmp(parsedDate, now);
      if (compared === 0) {
        foundToday = true;
      } else if (compared > 0) {
        foundToday = true;
        groupedDates.push({
          date: now,
          items: [],
        });
      }
    }

    if (groupedDates.length === 0 || daycmp(groupedDates[groupedDates.length - 1].date, parsedDate) !== 0) {
      // Add new grouped date
      groupedDates.push({
        date: parsedDate,
        items: [dateInfo],
        first: groupedDates.length === 0,
      });
    } else {
      groupedDates[groupedDates.length - 1].items.push(dateInfo);
    }
  });
  if (!foundToday) {
    groupedDates.push({ date: now, items: [] });
  }
  if (groupedDates.length) {
    groupedDates[groupedDates.length - 1].last = true;
  }

  return (
    <ul className="list-unstyled m-0 mt-4 pt-2">
      {groupedDates.map((groupedDate) => (
        <Day key={groupedDate.date} {...groupedDate} />
      ))}
    </ul>
  );
};

export default Timeline;
