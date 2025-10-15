import { getLocale, isRtl, useIntl } from '@edx/frontend-platform/i18n';
import { DataTable } from '@openedx/paragon';
import { useContextId } from '../../../../data/hooks';

import { useModel } from '../../../../generic/model-store';
import messages from '../messages';
import SubsectionTitleCell from './SubsectionTitleCell';
import { showUngradedAssignments } from '../../utils';

const DetailedGradesTable = () => {
  const intl = useIntl();
  const courseId = useContextId();

  const {
    sectionScores,
  } = useModel('progress', courseId);

  const isLocaleRtl = isRtl(getLocale());
  return (
    sectionScores.map((chapter) => {
      const subsectionScores = chapter.subsections.filter(
        (subsection) => !!(
          (showUngradedAssignments() || subsection.hasGradedAssignment)
            && subsection.showGrades
            && (subsection.numPointsPossible > 0 || subsection.numPointsEarned > 0)
        ),
      );

      if (subsectionScores.length === 0) {
        return null;
      }

      const detailedGradesData = subsectionScores.map((subsection) => ({
        subsectionTitle: <SubsectionTitleCell subsection={subsection} />,
        score: <span className={subsection.learnerHasAccess ? '' : 'greyed-out'}>{subsection.numPointsEarned}{isLocaleRtl ? '\\' : '/'}{subsection.numPointsPossible}</span>,
      }));

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
                cellClassName: 'align-top text-right small',
              },
            ]}
          >
            <DataTable.Table />
          </DataTable>
        </div>
      );
    })
  );
};

export default DetailedGradesTable;
