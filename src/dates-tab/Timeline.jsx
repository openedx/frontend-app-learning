import React from 'react';
import { useSelector } from 'react-redux';

import { useModel } from '../model-store';

import Day from './Day';
import { daycmp, isLearnerAssignment } from './utils';

export default function Timeline() {
  const {
    courseId,
  } = useSelector(state => state.courseware);

  const {
    courseDateBlocks,
  } = useModel('dates', courseId);

  // Group date items by day (assuming they are sorted in first place) and add some metadata
  const groupedDates = [];
  const now = new Date();
  let foundNextDue = false;
  let foundToday = false;
  courseDateBlocks.forEach(dateInfo => {
    const parsedDate = new Date(dateInfo.date);

    let hasDueNextAssignment = false;
    if (!foundNextDue && parsedDate >= now && isLearnerAssignment(dateInfo) && !dateInfo.complete) {
      foundNextDue = true;
      hasDueNextAssignment = true;
    }

    if (!foundToday) {
      const compared = daycmp(parsedDate, now);
      if (compared === 0) {
        foundToday = true;
      } else if (compared > 0) {
        foundToday = true;
        groupedDates.push({
          date: now,
          hasDueNextAssignment: false,
          items: [],
        });
      }
    }

    if (groupedDates.length === 0 || daycmp(groupedDates[groupedDates.length - 1].date, parsedDate) !== 0) {
      // Add new grouped date
      groupedDates.push({
        date: parsedDate,
        hasDueNextAssignment,
        items: [dateInfo],
        first: groupedDates.length === 0,
      });
    } else {
      if (hasDueNextAssignment) {
        groupedDates[groupedDates.length - 1].hasNextAssigment = true;
      }
      groupedDates[groupedDates.length - 1].items.push(dateInfo);
    }
  });
  if (groupedDates.length) {
    groupedDates[groupedDates.length - 1].last = true;
  }

  return (
    <>
      {groupedDates.map((groupedDate) => (
        <Day key={groupedDate.date} {...groupedDate} />
      ))}
    </>
  );
}
