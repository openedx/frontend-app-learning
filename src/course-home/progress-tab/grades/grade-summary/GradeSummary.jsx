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

  // Accumulate grades for each assignment type
  const gradeByAssignmentType = {};
  assignmentPolicies.forEach(assignment => {
    // Create an array with the number of total assignments and set the scores to 0
    // as placeholders for assignments that have not yet been released
    gradeByAssignmentType[assignment.type] = {
      grades: Array(assignment.numTotal).fill(0),
      numAssignmentsCreated: 0,
      numTotalExpectedAssignments: assignment.numTotal,
    };
  });

  sectionScores.forEach((chapter) => {
    chapter.subsections.forEach((subsection) => {
      if (!subsection.hasGradedAssignment) {
        return;
      }
      const {
        assignmentType,
        numPointsEarned,
        numPointsPossible,
      } = subsection;
      let {
        numAssignmentsCreated,
      } = gradeByAssignmentType[assignmentType];

      numAssignmentsCreated++;
      if (numAssignmentsCreated <= gradeByAssignmentType[assignmentType].numTotalExpectedAssignments) {
        // Remove a placeholder grade so long as the number of recorded created assignments is less than the number
        // of expected assignments
        gradeByAssignmentType[assignmentType].grades.shift();
      }
      // Add the graded assignment to the list
      gradeByAssignmentType[assignmentType].grades.push(numPointsEarned ? numPointsEarned / numPointsPossible : 0);
      // Record the created assignment
      gradeByAssignmentType[assignmentType].numAssignmentsCreated = numAssignmentsCreated;
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
