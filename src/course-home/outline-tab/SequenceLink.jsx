import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { faCheckCircle as fasCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle as farCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useModel } from '../../generic/model-store';
import messages from './messages';

function SequenceLink({
  id,
  intl,
  courseId,
  first,
  sequence,
}) {
  const {
    complete,
    description,
    due,
    showLink,
    title,
  } = sequence;
  const {
    datesWidget: {
      userTimezone,
    },
  } = useModel('outline', courseId);

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  const displayTitle = showLink ? <Link to={`/course/${courseId}/${id}`}>{title}</Link> : title;

  return (
    <div className={classNames('', { 'mt-2 pt-2 border-top border-light': !first })}>
      <div className="row w-100 m-0">
        <div className="col-auto p-0">
          {complete ? (
            <FontAwesomeIcon
              icon={fasCheckCircle}
              fixedWidth
              className="float-left text-success mt-1"
              aria-hidden="true"
              title={intl.formatMessage(messages.completedAssignment)}
            />
          ) : (
            <FontAwesomeIcon
              icon={farCheckCircle}
              fixedWidth
              className="float-left text-gray-200 mt-1"
              aria-hidden="true"
              title={intl.formatMessage(messages.incompleteAssignment)}
            />
          )}
        </div>
        <div className="col-10 p-0 ml-2 pl-1 text-break">{displayTitle}</div>
        <span className="sr-only">
          , {intl.formatMessage(complete ? messages.completedAssignment : messages.incompleteAssignment)}
        </span>
      </div>
      {due && (
        <div className="row w-100 m-0 ml-3 pl-3">
          <small className="text-body">
            <FormattedMessage
              id="learning.outline.sequence-due"
              defaultMessage="{description} due {assignmentDue}"
              description="Used below an assignment title"
              values={{
                assignmentDue: (
                  <FormattedTime
                    key={`${id}-due`}
                    day="numeric"
                    month="short"
                    year="numeric"
                    hour12={false}
                    timeZoneName="short"
                    value={due}
                    {...timezoneFormatArgs}
                  />
                ),
                description: description || '',
              }}
            />
          </small>
        </div>
      )}
    </div>
  );
}

SequenceLink.propTypes = {
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  first: PropTypes.bool.isRequired,
  sequence: PropTypes.shape().isRequired,
};

export default injectIntl(SequenceLink);
