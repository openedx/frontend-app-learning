import React from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '@openedx/paragon';
import { CheckCircleOutline, CheckCircle } from '@openedx/paragon/icons';

import { getSequenceUrl } from '@src/courseware/urls';
import EffortEstimate from '../../../shared/effort-estimate';
import type { CourseHomeOutlineSequence } from '../../data/courseHomeOutline';
import messages from '../messages';

interface Props {
  complete: boolean;
  showLink: boolean;
  title: string;
  sequence: CourseHomeOutlineSequence;
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
  const { courseId } = useParams();
  const displayTitle = showLink && courseId ? <Link to={getSequenceUrl(courseId, id)}>{title}</Link> : title;

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
