import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Hyperlink,
  Icon,
  OverlayTrigger,
  Stack,
  Tooltip,
  IconButton,
} from '@openedx/paragon';
import { InfoOutline, Locked } from '@openedx/paragon/icons';

import { useContextId } from '../../../../data/hooks';
import messages from '../messages';
import { useModel } from '../../../../generic/model-store';

const GradeSummaryHeader = ({ allOfSomeAssignmentTypeIsLocked }) => {
  const intl = useIntl();
  const courseId = useContextId();
  const {
    verifiedMode,
    gradesFeatureIsFullyLocked,
  } = useModel('progress', courseId);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setShowTooltip(false);
    }
  };

  return (
    <Stack gap={2} className="mb-3">
      <Stack direction="horizontal" gap={2}>
        <h3 className="h4 m-0">{intl.formatMessage(messages.gradeSummary)}</h3>
        <OverlayTrigger
          trigger="click"
          placement="top"
          show={showTooltip}
          overlay={(
            <Tooltip>
              {intl.formatMessage(messages.gradeSummaryTooltipBody)}
            </Tooltip>
          )}
        >
          <IconButton
            onClick={() => { setShowTooltip(!showTooltip); }}
            onBlur={() => { setShowTooltip(false); }}
            onKeyDown={handleKeyDown}
            alt={intl.formatMessage(messages.gradeSummaryTooltipAlt)}
            iconAs={InfoOutline}
            size="sm"
            disabled={gradesFeatureIsFullyLocked}
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
