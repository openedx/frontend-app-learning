import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { DataTable } from '@edx/paragon';

import messages from '../messages';
import { useModel } from '../../../../generic/model-store';

function DetailedGradesTable({ intl, sectionScores }) {
  const {
    courseId,
    gradesFeatureIsLocked,
  } = useSelector(state => state.courseHome);
  const {
    org,
  } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();
  const logSubsectionClicked = (blockKey) => {
    sendTrackEvent('edx.ui.lms.course_progress.detailed_grades_assignment.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
      assignment_block_key: blockKey,
    });
  };
  return (
    sectionScores.map((chapter) => {
      const subsectionScores = chapter.subsections.filter(
        (subsection) => !!(
          subsection.hasGradedAssignment
          && subsection.showGrades
          && (subsection.numPointsPossible > 0 || subsection.numPointsEarned > 0)),
      );

      if (subsectionScores.length === 0) {
        return null;
      }

      const detailedGradesData = subsectionScores.map((subsection) => {
        const title = (
          <a
            href={subsection.url}
            className="muted-link small"
            onClick={() => {
              logSubsectionClicked(subsection.blockKey);
            }}
            tabIndex={gradesFeatureIsLocked ? '-1' : '0'}
          >
            {subsection.displayName}
          </a>
        );
        return {
          subsectionTitle: title,
          score: `${subsection.numPointsEarned}/${subsection.numPointsPossible}`,
        };
      });

      return (
        <div className="my-3" key={`${chapter.displayName}-grades-table`}>
          <DataTable
            data={detailedGradesData}
            itemCount={detailedGradesData.length}
            columns={[
              {
                Header: chapter.displayName,
                accessor: 'subsectionTitle',
                headerClassName: 'h5 mb-0',
                cellClassName: 'mw-100',
              },
              {
                Header: `${intl.formatMessage(messages.score)}`,
                accessor: 'score',
                headerClassName: 'justify-content-end h5 mb-0',
                cellClassName: 'float-right text-right small',
              },
            ]}
          >
            <DataTable.Table />
          </DataTable>
        </div>
      );
    })
  );
}

DetailedGradesTable.propTypes = {
  intl: intlShape.isRequired,
  sectionScores: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    subsections: PropTypes.arrayOf(PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      numPointsEarned: PropTypes.number.isRequired,
      numPointsPossible: PropTypes.number.isRequired,
      url: PropTypes.string.isRequired,
    })),
  })).isRequired,
};

DetailedGradesTable.defaultProps = {
  sectionScores: {
    subsections: [],
  },
};

export default injectIntl(DetailedGradesTable);
