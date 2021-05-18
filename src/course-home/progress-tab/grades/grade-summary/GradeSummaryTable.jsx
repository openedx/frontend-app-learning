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

  const calculateWeightedGrade = (numPointsEarned, numPointsPossible, assignmentWeight) => (
    numPointsPossible > 0 ? ((numPointsEarned * assignmentWeight * 100) / numPointsPossible).toFixed(0) : 0
  );

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

    const weightedGrade = calculateWeightedGrade(
      gradeByAssignmentType[assignment.type].numPointsEarned,
      gradeByAssignmentType[assignment.type].numPointsPossible,
      assignment.weight,
    );

    return {
      type: { footnoteId, footnoteMarker, type: assignment.type },
      weight: `${assignment.weight * 100}%`,
      score: `${gradeByAssignmentType[assignment.type].numPointsEarned}/${gradeByAssignmentType[assignment.type].numPointsPossible}`,
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
            Header: `${intl.formatMessage(messages.score)}`,
            accessor: 'score',
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
