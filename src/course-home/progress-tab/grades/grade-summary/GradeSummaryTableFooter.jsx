import React from 'react';
import { useSelector } from 'react-redux';

import {
  getLocale, injectIntl, intlShape, isRtl,
} from '@edx/frontend-platform/i18n';
import { DataTable } from '@edx/paragon';
import { useModel } from '../../../../generic/model-store';

import messages from '../messages';

const GradeSummaryTableFooter = ({ intl }) => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    courseGrade: {
      percent,
    },
  } = useModel('progress', courseId);

  const totalGrade = (percent * 100).toFixed(0);

  const isLocaleRtl = isRtl(getLocale());

  return (
    <DataTable.TableFooter>
      <div className="row w-100 m-0">
        <div id="weighted-grade-summary" className="col-8 font-weight-semi-bold p-0">{intl.formatMessage(messages.weightedGradeSummary)}</div>
        <div data-testid="gradeSummaryFooterTotalWeightedGrade" aria-labelledby="weighted-grade-summary" className="col-4 p-0 text-right font-weight-semi-bold text-secondary">{totalGrade}{isLocaleRtl && '\u200f'} %</div>
      </div>
    </DataTable.TableFooter>
  );
};

GradeSummaryTableFooter.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(GradeSummaryTableFooter);
