import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { DataTable } from '@openedx/paragon';

import { GradeData } from '@src/pathways/data/types';

import { Link } from 'react-router-dom';
import messages from './messages';
import { PathwayProgressRing } from './progress-ring/PathwayProgressRing';

// The cells are defined outside of `PathwayGrades` so React does not remount them on every render.
const PercentCell = ({ value }: { value: number }) => {
  const intl = useIntl();
  return <>{intl.formatNumber(value / 100, { style: 'percent' })}</>;
};

const ProgressCell = ({ value }: { value: number }) => (
  <span className="d-flex align-items-center">
    <PathwayProgressRing className="learning-pathway-progress-ring-sm mr-2" percentage={value} aria-hidden />
    <PercentCell value={value} />
  </span>
);

// Green when the course is passed, red otherwise
const CurrentGradeCell = ({ value, row }: { value: number, row: { original: GradeData } }) => {
  if (row.original.progress === 0) {
    return <>-</>;
  }

  return (
    <span className={value >= row.original.passGrade ? 'text-success' : 'text-danger'}>
      <PercentCell value={value} />
    </span>
  );
};

const DetailsCell = ({ row }: { row: { original: GradeData } }) => (
  <Link to={row.original.detailsUrl}>
    <FormattedMessage {...messages.gradesViewDetails} />
  </Link>
);

export const PathwayGrades = ({ grades }: { grades: GradeData[] }) => {
  const intl = useIntl();

  return (
    <DataTable
      columns={[
        {
          Header: intl.formatMessage(messages.gradesCourseColumn),
          accessor: 'displayName',
        },
        {
          Header: intl.formatMessage(messages.gradesProgressColumn),
          accessor: 'progress',
          Cell: ProgressCell,
        },
        {
          Header: intl.formatMessage(messages.gradesPassGradeColumn),
          accessor: 'passGrade',
          Cell: PercentCell,
        },
        {
          Header: intl.formatMessage(messages.gradesCurrentGradeColumn),
          accessor: 'currentGrade',
          Cell: CurrentGradeCell,
        },
      ]}
      itemCount={grades.length}
      data={grades}
      additionalColumns={[
        {
          id: 'action',
          Cell: DetailsCell,
        },
      ]}
    >
      <DataTable.Table />
    </DataTable>
  );
};
