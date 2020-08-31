import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { FormattedMessage, FormattedTime } from '@edx/frontend-platform/i18n';
import { faClock, faEdit } from '@fortawesome/free-regular-svg-icons';
import {
  faCheck,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useModel } from '../../generic/model-store';

export default function SequenceLink({
  id,
  courseId,
  first,
  sequence,
}) {
  const {
    complete,
    description,
    due,
    icon,
    showLink,
    title,
  } = sequence;
  const {
    datesWidget: {
      userTimezone,
    },
  } = useModel('outline', courseId);

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  let text = title;

  let faIcon;
  switch (icon) {
    // list of possible ones here: https://github.com/edx/edx-proctoring/blob/master/edx_proctoring/api.py
    case 'fa-check': faIcon = faCheck; break;
    case 'fa-clock-o': faIcon = faClock; break;
    case 'fa-exclamation-triangle': faIcon = faExclamationTriangle; break;
    case 'fa-pencil-square-o': faIcon = faEdit; break;
    case 'fa-spinner fa-spin': faIcon = faSpinner; break;
    case 'fa-times-circle': faIcon = faTimesCircle; break;
    default: faIcon = null; break;
  }
  if (faIcon) {
    text = <><FontAwesomeIcon icon={faIcon} /> {text}</>;
  }

  if (due) {
    text = (
      <>
        {text}<br />
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
      </>
    );
  }

  text = <div className="ml-4">{text}</div>;

  if (complete) {
    text = <><FontAwesomeIcon icon={faCheckCircle} className="float-left text-success mt-1" />{text}</>;
  }

  // Do link last so we include everything above in the link
  if (showLink) {
    text = <Link to={`/course/${courseId}/${id}`}><div>{text}</div></Link>;
  }

  return (
    <div className={classNames('', { 'mt-2 pt-2 border-top border-light': !first })}>
      {text}
    </div>
  );
}

SequenceLink.propTypes = {
  id: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  first: PropTypes.bool.isRequired,
  sequence: PropTypes.shape().isRequired,
};
