import React, { useState } from 'react';

import { useProgressData } from '../../hooks';

import GradeSummaryHeader from './GradeSummaryHeader';
import GradeSummaryTable from './GradeSummaryTable';

const GradeSummary = () => {
  const {
    assignmentTypeGradeSummary,
  } = useProgressData();

  const [allOfSomeAssignmentTypeIsLocked, setAllOfSomeAssignmentTypeIsLocked] = useState(false);

  if (assignmentTypeGradeSummary.length === 0) {
    return null;
  }

  return (
    <section className="text-dark-700 mb-4">
      <GradeSummaryHeader allOfSomeAssignmentTypeIsLocked={allOfSomeAssignmentTypeIsLocked} />
      <GradeSummaryTable setAllOfSomeAssignmentTypeIsLocked={setAllOfSomeAssignmentTypeIsLocked} />
    </section>
  );
};

export default GradeSummary;
