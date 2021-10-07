import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useModel } from '../../../../generic/model-store';

import GradeSummaryHeader from './GradeSummaryHeader';
import GradeSummaryTable from './GradeSummaryTable';

function GradeSummary() {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    gradingPolicy: {
      assignmentPolicies,
    },
  } = useModel('progress', courseId);

  const [allOfSomeAssignmentTypeIsLocked, setAllOfSomeAssignmentTypeIsLocked] = useState(false);

  if (assignmentPolicies.length === 0) {
    return null;
  }

  return (
    <section className="text-dark-700 mb-4">
      <GradeSummaryHeader allOfSomeAssignmentTypeIsLocked={allOfSomeAssignmentTypeIsLocked} />
      <GradeSummaryTable setAllOfSomeAssignmentTypeIsLocked={setAllOfSomeAssignmentTypeIsLocked} />
    </section>
  );
}

export default GradeSummary;
