import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import {
  getLocale, injectIntl, intlShape, isRtl,
} from '@edx/frontend-platform/i18n';
import { DataTable } from '@openedx/paragon';
import { useModel } from '../../../../generic/model-store';

import AssignmentTypeCell from './AssignmentTypeCell';
import DroppableAssignmentFootnote from './DroppableAssignmentFootnote';
import GradeSummaryTableFooter from './GradeSummaryTableFooter';

import messages from '../messages';

const GradeSummaryTable = ({ intl, setAllOfSomeAssignmentTypeIsLocked }) => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    gradingPolicy: {
      assignmentPolicies,
    },
    gradesFeatureIsFullyLocked,
    sectionScores,
  } = useModel('progress', courseId);

  const footnotes = [];

  const getFootnoteId = (assignment) => {
    const footnoteId = assignment.shortLabel ? assignment.shortLabel : assignment.type;
    return footnoteId.replace(/[^A-Za-z0-9.-_]+/g, '-');
  };

  const hasNoAccessToAssignmentsOfType = (assignmentType) => {
    const subsectionAssignmentsOfType = sectionScores.map((chapter) => chapter.subsections.filter((subsection) => (
      subsection.assignmentType === assignmentType && subsection.hasGradedAssignment
      && (subsection.numPointsPossible > 0 || subsection.numPointsEarned > 0)
    ))).flat();
    if (subsectionAssignmentsOfType.length) {
      const noAccessToAssignmentsOfType = !subsectionAssignmentsOfType.some((subsection) => (
        subsection.learnerHasAccess === true
      ));
      if (noAccessToAssignmentsOfType) {
        setAllOfSomeAssignmentTypeIsLocked(true);
        return true;
      }
    }
    return false;
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

    const locked = !gradesFeatureIsFullyLocked && hasNoAccessToAssignmentsOfType(assignment.type);

    const isLocaleRtl = isRtl(getLocale());

    return {
      type: {
        footnoteId, footnoteMarker, type: assignment.type, locked,
      },
      weight: { weight: `${(assignment.weight * 100).toFixed(0)}${isLocaleRtl ? '\u200f' : ''}%`, locked },
      grade: { grade: `${(assignment.averageGrade * 100).toFixed(0)}${isLocaleRtl ? '\u200f' : ''}%`, locked },
      weightedGrade: { weightedGrade: `${(assignment.weightedGrade * 100).toFixed(0)}${isLocaleRtl ? '\u200f' : ''}%`, locked },
    };
  });
  const getAssignmentTypeCell = (value) => (
    <AssignmentTypeCell
      assignmentType={value.type} // eslint-disable-line react/prop-types
      footnoteId={value.footnoteId} // eslint-disable-line react/prop-types
      footnoteMarker={value.footnoteMarker} // eslint-disable-line react/prop-types
      locked={value.locked} // eslint-disable-line react/prop-types
    />
  );

  const getCell = (locked, value) => <span className={locked ? 'greyed-out' : ''}>{value}</span>;

  return (
    <>
      <DataTable
        data={gradeSummaryData}
        itemCount={gradeSummaryData.length}
        columns={[
          {
            Header: `${intl.formatMessage(messages.assignmentType)}`,
            accessor: 'type',
            Cell: ({ value }) => getAssignmentTypeCell(value),
            headerClassName: 'h5 mb-0',
          },
          {
            Header: `${intl.formatMessage(messages.weight)}`,
            accessor: 'weight',
            headerClassName: 'justify-content-end h5 mb-0',
            Cell: ({ value }) => getCell(value.locked, value.weight),
            cellClassName: 'text-right small',
          },
          {
            Header: `${intl.formatMessage(messages.grade)}`,
            accessor: 'grade',
            headerClassName: 'justify-content-end h5 mb-0',
            Cell: ({ value }) => getCell(value.locked, value.grade),
            cellClassName: 'text-right small',
          },
          {
            Header: `${intl.formatMessage(messages.weightedGrade)}`,
            accessor: 'weightedGrade',
            headerClassName: 'justify-content-end h5 mb-0 text-right',
            Cell: ({ value }) => getCell(value.locked, value.weightedGrade),
            cellClassName: 'text-right font-weight-bold small',
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
};

GradeSummaryTable.propTypes = {
  intl: intlShape.isRequired,
  setAllOfSomeAssignmentTypeIsLocked: PropTypes.func.isRequired,
};

export default injectIntl(GradeSummaryTable);
