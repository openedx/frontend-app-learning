import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Hyperlink,
  Icon,
  OverlayTrigger,
  Stack,
  Tooltip,
} from '@openedx/paragon';
import { InfoOutline, Locked } from '@openedx/paragon/icons';
import { useContextId } from '../../../../data/hooks';

import messages from '../messages';
import { useModel } from '../../../../generic/model-store';

const GradeSummaryHeader = ({ allOfSomeAssignmentTypeIsLocked }) => {
  const intl = useIntl();
  const courseId = useContextId();
  const {
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);
  const {
    verifiedMode,
  } = useModel('courseHomeMeta', courseId);

  return (
    <Stack gap={2} className="mb-3">
      <Stack direction="horizontal" gap={2}>
        <h3 className="h4 m-0">{intl.formatMessage(messages.gradeSummary)}</h3>
        <OverlayTrigger
          trigger="hover"
          placement="top"
          overlay={(
            <Tooltip>
              {intl.formatMessage(messages.gradeSummaryTooltipBody)}
            </Tooltip>
          )}
        >
          <Icon
            alt={intl.formatMessage(messages.gradeSummaryTooltipAlt)}
            src={InfoOutline}
            size="sm"
          />
        </OverlayTrigger>
      </Stack>
      {!gradesFeatureIsFullyLocked && allOfSomeAssignmentTypeIsLocked && (
        <Stack direction="horizontal" className="small" gap={2}>
          <Icon size="sm" src={Locked} data-testid="locked-icon" />
          <span>
            {intl.formatMessage(
              messages.gradeSummaryLimitedAccessExplanation,
              {
                upgradeLink: verifiedMode && (
                  <Hyperlink destination={verifiedMode.upgradeUrl}>
                    {intl.formatMessage(messages.courseGradePreviewUpgradeButton)}.
                  </Hyperlink>
                ),
              },
            )}
          </span>
        </Stack>
      )}
    </Stack>
  );
};

GradeSummaryHeader.propTypes = {
  allOfSomeAssignmentTypeIsLocked: PropTypes.bool.isRequired,
};

export default GradeSummaryHeader;
