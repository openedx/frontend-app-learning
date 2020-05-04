import React from 'react';
import { useSelector } from 'react-redux';

import { useModel } from '../model-store';

import Day from './Day';

export default function Timeline() {
  const {
    courseId,
  } = useSelector(state => state.courseware);

  const {
    dates,
  } = useModel('dates', courseId);

  return (
    <div className="border-left border-gray-900 ml-2 pl-4">
      {dates.map((date) => (
        <Day dateInfo={date} />
      ))}
    </div>
  );
}
