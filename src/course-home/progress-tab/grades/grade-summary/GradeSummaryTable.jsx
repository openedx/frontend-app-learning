import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { DataTable } from '@edx/paragon';
import { useModel } from '../../../../generic/model-store';

import AssignmentTypeCell from './AssignmentTypeCell';
import DroppableAssignmentFootnote from './DroppableAssignmentFootnote';
import GradeSummaryTableFooter from './GradeSummaryTableFooter';

import messages from '../messages';

function GradeSummaryTable({
  gradeByAssignmentType, intl,
}) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    gradingPolicy: {
      assignmentPolicies,
    },
  } = useModel('progress', courseId);

  const footnotes = [];

  const calculateAssignmentTypeGrades = (points, assignmentWeight, numDroppable) => {
    let dropCount = numDroppable;
    // Drop the lowest grades
    while (dropCount && points.length >= dropCount) {
      const lowestScore = Math.min(...points);
      const lowestScoreIndex = points.indexOf(lowestScore);
      points.splice(lowestScoreIndex, 1);
      dropCount--;
    }
    let averageGrade = 0;
    let weightedGrade = 0;
    if (points.length) {
      averageGrade = Number(((points.reduce((a, b) => a + b, 0) / points.length) * 100).toFixed(0));
      weightedGrade = (averageGrade * assignmentWeight).toFixed(0);
    }
    return { averageGrade, weightedGrade };
  };

  const getFootnoteId = (assignment) => {
    const footnoteId = assignment.shortLabel ? assignment.shortLabel : assignment.type;
    return footnoteId.replace(/[^A-Za-z0-9.-_]+/g, '-');
  };

  const gradeSummaryData = assignmentPolicies.map((assignment) => {
    let footnoteId = '';
    let footnoteMarker;

    if (assignment.numDroppable > 0) {
      footnoteId = getFootnoteId(assignment);
      footnotes.push({
        id: footnoteId,
        numDroppable: assignment.numDroppable,
        assignmentType: assignment.type,
      });

      footnoteMarker = footnotes.length;
    }

    const {
      averageGrade,
      weightedGrade,
    } = calculateAssignmentTypeGrades(
      gradeByAssignmentType[assignment.type].grades,
      assignment.weight,
      assignment.numDroppable,
    );

    return {
      type: { footnoteId, footnoteMarker, type: assignment.type },
      weight: `${assignment.weight * 100}%`,
      grade: `${averageGrade}%`,
      weightedGrade: `${weightedGrade}%`,
    };
  });

  return (
    <>
      <DataTable
        data={gradeSummaryData}
        itemCount={gradeSummaryData.length}
        columns={[
          {
            Header: `${intl.formatMessage(messages.assignmentType)}`,
            accessor: 'type',
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <AssignmentTypeCell
                assignmentType={value.type} // eslint-disable-line react/prop-types
                footnoteId={value.footnoteId} // eslint-disable-line react/prop-types
                footnoteMarker={value.footnoteMarker} // eslint-disable-line react/prop-types
              />
            ),
            headerClassName: 'h5 mb-0',
          },
          {
            Header: `${intl.formatMessage(messages.weight)}`,
            accessor: 'weight',
            headerClassName: 'justify-content-end h5 mb-0',
            cellClassName: 'float-right small',
          },
          {
            Header: `${intl.formatMessage(messages.grade)}`,
            accessor: 'grade',
            headerClassName: 'justify-content-end h5 mb-0',
            cellClassName: 'float-right small',
          },
          {
            Header: `${intl.formatMessage(messages.weightedGrade)}`,
            accessor: 'weightedGrade',
            headerClassName: 'justify-content-end h5 mb-0 text-right',
            cellClassName: 'float-right font-weight-bold small',
          },
        ]}
      >
        <DataTable.Table />
        <GradeSummaryTableFooter />
      </DataTable>

      {footnotes && (
        <DroppableAssignmentFootnote footnotes={footnotes} />
      )}
    </>
  );
}

GradeSummaryTable.propTypes = {
  gradeByAssignmentType: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(GradeSummaryTable);
