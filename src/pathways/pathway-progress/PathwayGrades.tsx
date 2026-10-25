import { FormattedMessage, FormattedNumber, useIntl } from "@edx/frontend-platform/i18n";
import { DataTable } from "@openedx/paragon";

import { GradeData } from "@src/pathways/data/types";

import messages from "./messages";
import { PathwayProgressRing } from "./progress-ring/PathwayProgressRing";
import { Link } from "react-router-dom";

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
          Cell: ({ value }) => (
            <span className="d-flex align-items-center">
              <PathwayProgressRing className="learning-pathway-progress-ring-sm mr-2" percentage={value} aria-hidden />
              <FormattedNumber value={value / 100} style="percent" />
            </span>
          ),
        },
        {
          Header: intl.formatMessage(messages.gradesPassGradeColumn),
          accessor: 'passGrade',
          Cell: ({ value }) => <FormattedNumber value={value / 100} style="percent" />,
        },
        {
          Header: intl.formatMessage(messages.gradesCurrentGradeColumn),
          accessor: 'currentGrade',
          Cell: ({ value }) => <FormattedNumber value={value / 100} style="percent" />,
        },
      ]}
      itemCount={grades.length}
      data={grades}
      additionalColumns={[
        {
          id: 'action',
          Cell: ({ row }) => (
            <Link to={row.original.detailsUrl}>
              <FormattedMessage {...messages.gradesViewDetails} />
            </Link>
          )
        }
      ]}
    >
      <DataTable.Table />
    </DataTable>
  );
};
