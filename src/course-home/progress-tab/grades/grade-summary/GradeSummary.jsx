import React, { useState } from 'react';

import { useContextId } from '../../../../data/hooks';
import { useModel } from '../../../../generic/model-store';

import GradeSummaryHeader from './GradeSummaryHeader';
import GradeSummaryTable from './GradeSummaryTable';

const GradeSummary = () => {
  const courseId = useContextId();

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
};

export default GradeSummary;
