import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { CheckCircle, CheckCircleOutline, DisabledVisible } from '@openedx/paragon/icons';

import messages from '../messages';

interface Props {
  complete: boolean;
  hideFromTOC: boolean;
  title: string;
  // Added effortTime to the section data to store the estimated time for the section
  effortTime?: number;
  showOutlineEstimatedTime?: boolean;
}

// Component to render the section title in the course outline, including the completion status, title, and estimated time (if available and enabled)
const SectionTitle: React.FC<Props> = ({
  complete,
  hideFromTOC,
  title,
  effortTime = 0,
  showOutlineEstimatedTime = true,
}) => {
  const intl = useIntl();
  const minuteCount = effortTime > 0 ? Math.ceil(effortTime / 60) : 0;
  const minutesLabel = showOutlineEstimatedTime
    ? (minuteCount > 0
      ? intl.formatMessage(messages.estimatedTimeMinutesAbbreviated, { minuteCount })
      : 'x min')
    : null;
  return (
    <div className="d-flex row w-100 m-0">
      <div className="col-auto p-0">
        {complete ? (
          <Icon
            src={CheckCircle}
            className="float-left mt-1 text-success"
            aria-hidden="true"
            svgAttrs={{ 'aria-label': intl.formatMessage(messages.completedSection) }}
            size="sm"
          />
        ) : (
          <Icon
            src={CheckCircleOutline}
            className="float-left mt-1 text-gray-400"
            aria-hidden="true"
            svgAttrs={{ 'aria-label': intl.formatMessage(messages.incompleteSection) }}
            size="sm"
          />
        )}
      </div>
      <div className="col-7 ml-3 p-0 font-weight-bold text-dark-500">
        <span className="align-middle col-6">{title}</span>
        {minutesLabel && (
          <span className="small text-gray-500 ml-2 align-middle font-weight-normal">
            {minutesLabel}
          </span>
        )}
        <span className="sr-only">
          , {intl.formatMessage(complete ? messages.completedSection : messages.incompleteSection)}
        </span>
      </div>
      {hideFromTOC && (
      <div className="row">
        {hideFromTOC && (
          <span className="small d-flex align-content-end">
            <Icon className="mr-2" src={DisabledVisible} data-testid="hide-from-toc-section-icon" />
            <span data-testid="hide-from-toc-section-text">
              {intl.formatMessage(messages.hiddenSection)}
            </span>
          </span>
        )}
      </div>
      )}
    </div>
  );
};

export default SectionTitle;
