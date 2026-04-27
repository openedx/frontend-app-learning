import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Link } from 'react-router-dom';
import { Icon } from '@openedx/paragon';
import { CheckCircleOutline, CheckCircle } from '@openedx/paragon/icons';

import EffortEstimate from '../../../shared/effort-estimate';
import messages from '../messages';
import { useContextId } from '../../../data/hooks';

interface Props {
  complete: boolean;
  showLink: boolean;
  //Added showOutlineEstimatedTime and sequence data to the SequenceTitle component to control whether to show the 
  // estimated time for sequences in the course outline and to pass the estimated time data down to the component
  showOutlineEstimatedTime?: boolean;
  title: string;
  sequence: {
    effortActivities?: number;
    effortTime?: number;
  };
  id: string;
}

const SequenceTitle: React.FC<Props> = ({
  complete,
  showLink,
  // Default showOutlineEstimatedTime to true (can be turned off later)
  showOutlineEstimatedTime = true,
  title,
  sequence,
  id,
}) => {
  const intl = useIntl();
  const courseId = useContextId();
  const coursewareUrl = <Link to={`/course/${courseId}/${id}`}>{title}</Link>;
  const displayTitle = showLink ? coursewareUrl : title;
  const minuteCount = sequence?.effortTime ? Math.ceil(sequence.effortTime / 60) : 0;
  // Format of the estimated time for seuqences in the course outline
  const minutesLabel = showOutlineEstimatedTime
    ? (minuteCount > 0
      ? intl.formatMessage(messages.estimatedTimeMinutesAbbreviated, { minuteCount })
      : 'x min')
    : null;

  return (
    <div className="row w-100 m-0">
      <div className="col-auto p-0">
        {complete ? (
          <Icon
            src={CheckCircle}
            className="float-left text-success mt-1"
            aria-hidden={complete}
            svgAttrs={{ 'aria-label': intl.formatMessage(messages.completedAssignment) }}
            size="sm"
          />
        ) : (
          <Icon
            src={CheckCircleOutline}
            className="float-left text-gray-400 mt-1"
            aria-hidden={complete}
            svgAttrs={{ 'aria-label': intl.formatMessage(messages.incompleteAssignment) }}
            size="sm"
          />
        )}
      </div>
      <div className="col-10 p-0 ml-3 text-break">
        <span className="align-middle">{displayTitle}</span>
        <span className="sr-only">
          , {intl.formatMessage(complete ? messages.completedAssignment : messages.incompleteAssignment)}
        </span>
        {minutesLabel && (
          <span className="ml-3 small text-gray-500 align-middle">
            {minutesLabel}
          </span>
        )}
        <EffortEstimate className="sr-only" block={sequence} />
      </div>
    </div>
  );
};

export default SequenceTitle;
