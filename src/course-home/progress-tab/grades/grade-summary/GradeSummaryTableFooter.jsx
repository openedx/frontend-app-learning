import { useContext } from 'react';
import { useSelector } from 'react-redux';

import { getLocale, isRtl, useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTable,
  DataTableContext,
  Icon,
  OverlayTrigger,
  Stack,
  Tooltip,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';

import { useModel } from '../../../../generic/model-store';
import messages from '../messages';

const GradeSummaryTableFooter = () => {
  const intl = useIntl();

  const { data } = useContext(DataTableContext);

  const rawGrade = data.reduce(
    (grade, currentValue) => {
      const { weightedGrade } = currentValue.weightedGrade;
      const percent = weightedGrade.replace(/%/g, '').trim();
      return grade + parseFloat(percent);
    },
    0,
  ).toFixed(2);

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

  const isLocaleRtl = isRtl(getLocale());

  return (
    <DataTable.TableFooter className={`border-top border-primary ${bgColor}`}>
      <div className="row w-100 m-0">
        <div id="weighted-grade-summary" className="col-8 p-0 small">
          <Stack gap={2} direction="horizontal">
            {intl.formatMessage(messages.weightedGradeSummary)}
            <OverlayTrigger
              trigger="hover"
              placement="bottom"
              overlay={(
                <Tooltip>
                  {intl.formatMessage(
                    messages.weightedGradeSummaryTooltip,
                    { roundedGrade: totalGrade, rawGrade },
                  )}
                </Tooltip>
              )}
            >
              <Icon
                src={InfoOutline}
                size="sm"
                alt={intl.formatMessage(messages.gradeSummaryTooltipAlt)}
              />
            </OverlayTrigger>
          </Stack>
        </div>
        <div data-testid="gradeSummaryFooterTotalWeightedGrade" aria-labelledby="weighted-grade-summary" className="col-4 p-0 text-right font-weight-bold small">{totalGrade}{isLocaleRtl && '\u200f'}%</div>
      </div>
    </DataTable.TableFooter>
  );
};

export default GradeSummaryTableFooter;
