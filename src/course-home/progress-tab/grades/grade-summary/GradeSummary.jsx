import React from 'react';
import { useSelector } from 'react-redux';
import { useModel } from '../../../../generic/model-store';

import GradeSummaryHeader from './GradeSummaryHeader';
import GradeSummaryTable from './GradeSummaryTable';

function GradeSummary() {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    sectionScores,
    gradingPolicy: {
      assignmentPolicies,
    },
  } = useModel('progress', courseId);

  if (assignmentPolicies.length === 0) {
    return null;
  }

  // accumulate grades for individual assignment types
  const gradeByAssignmentType = {};
  assignmentPolicies.forEach(assignment => {
    gradeByAssignmentType[assignment.type] = { numPointsEarned: 0, numPointsPossible: 0 };
  });

  sectionScores.forEach((chapter) => {
    chapter.subsections.forEach((subsection) => {
      if (subsection.hasGradedAssignment) {
        gradeByAssignmentType[subsection.assignmentType].numPointsEarned += subsection.numPointsEarned;
        gradeByAssignmentType[subsection.assignmentType].numPointsPossible += subsection.numPointsPossible;
      }
    });
  });

  return (
    <section className="text-dark-700 mb-4">
      <GradeSummaryHeader />
      <GradeSummaryTable
        gradeByAssignmentType={gradeByAssignmentType}
      />
    </section>
  );
}

export default GradeSummary;
