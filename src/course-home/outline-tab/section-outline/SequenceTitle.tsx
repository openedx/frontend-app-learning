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
  title: string;
  sequence: object;
  id: string;
}

const SequenceTitle: React.FC<Props> = ({
  complete,
  showLink,
  title,
  sequence,
  id,
}) => {
  const intl = useIntl();
  const courseId = useContextId();
  const coursewareUrl = <Link to={`/course/${courseId}/${id}`}>{title}</Link>;
  const displayTitle = showLink ? coursewareUrl : title;

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
        <EffortEstimate className="ml-3 align-middle" block={sequence} />
      </div>
    </div>
  );
};

export default SequenceTitle;
