import { getLocale, isRtl, useIntl } from '@edx/frontend-platform/i18n';
import {
  DataTable,
  Icon,
  OverlayTrigger,
  Stack,
  Tooltip,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { useContextId } from '../../../../data/hooks';

import { useModel } from '../../../../generic/model-store';
import messages from '../messages';

const GradeSummaryTableFooter = () => {
  const intl = useIntl();
  const courseId = useContextId();

  const {
    courseGrade: {
      isPassing,
      percent,
    },
    finalGrades,
  } = useModel('progress', courseId);

  const getGradePercent = (grade) => {
    const percent = grade * 100;
    return Number.isInteger(percent) ? percent.toFixed(0) : percent.toFixed(2);
  };

  const rawGrade = getGradePercent(finalGrades);

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
                    { roundedGrade: totalGrade, rawGrade: rawGrade },
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
