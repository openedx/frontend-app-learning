import React from 'react';
import { useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { DataTable } from '@edx/paragon';
import { useModel } from '../../../../generic/model-store';

import messages from '../messages';

function GradeSummaryTableFooter({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    courseGrade: {
      isPassing,
      percent,
    },
  } = useModel('progress', courseId);

  const bgColor = isPassing ? 'bg-success-100' : 'bg-warning-100';
  const totalGrade = (percent * 100).toFixed(0);

  return (
    <DataTable.TableFooter className={`border-top border-primary ${bgColor}`}>
      <div className="row w-100 m-0">
        <div id="weighted-grade-summary" className="col-8 p-0 small">{intl.formatMessage(messages.weightedGradeSummary)}</div>
        <div data-testid="gradeSummaryFooterTotalWeightedGrade" aria-labelledby="weighted-grade-summary" className="col-4 p-0 text-right font-weight-bold small">{totalGrade}%</div>
      </div>
    </DataTable.TableFooter>
  );
}

GradeSummaryTableFooter.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(GradeSummaryTableFooter);
