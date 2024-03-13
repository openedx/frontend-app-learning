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

import { Icon } from '@openedx/paragon';
import { Block } from '@openedx/paragon/icons';
import EffortEstimate from '../../shared/effort-estimate';
import { useModel } from '../../generic/model-store';
import messages from './messages';

const SequenceLink = ({
  id,
  intl,
  courseId,
  first,
  sequence,
}) => {
  const {
    complete,
    description,
    due,
    showLink,
    title,
    hideFromTOC,
  } = sequence;
  const {
    userTimezone,
  } = useModel('outline', courseId);

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  const coursewareUrl = <Link to={`/course/${courseId}/${id}`}>{title}</Link>;
  const displayTitle = showLink ? coursewareUrl : title;

  const dueDateMessage = (
    <FormattedMessage
      id="learning.outline.sequence-due-date-set"
      defaultMessage="{description} due {assignmentDue}"
      description="Used below an assignment title"
      values={{
        assignmentDue: (
          <FormattedTime
            key={`${id}-due`}
            day="numeric"
            month="short"
            year="numeric"
            timeZoneName="short"
            value={due}
            {...timezoneFormatArgs}
          />
        ),
        description: description || '',
      }}
    />
  );

  const noDueDateMessage = (
    <FormattedMessage
      id="learning.outline.sequence-due-date-not-set"
      defaultMessage="{description}"
      description="Used below an assignment title"
      values={{
        assignmentDue: (
          <FormattedTime
            key={`${id}-due`}
            day="numeric"
            month="short"
            year="numeric"
            timeZoneName="short"
            value={due}
            {...timezoneFormatArgs}
          />
        ),
        description: description || '',
      }}
    />
  );

  return (
    <li>
      <div className={classNames('', { 'mt-2 pt-2 border-top border-light': !first })}>
        <div className="row w-100 m-0">
          <div className="col-auto p-0">
            {complete ? (
              <FontAwesomeIcon
                icon={fasCheckCircle}
                fixedWidth
                className="float-left text-success mt-1"
                aria-hidden={complete}
                title={intl.formatMessage(messages.completedAssignment)}
              />
            ) : (
              <FontAwesomeIcon
                icon={farCheckCircle}
                fixedWidth
                className="float-left text-gray-400 mt-1"
                aria-hidden={complete}
                title={intl.formatMessage(messages.incompleteAssignment)}
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
        {hideFromTOC && (
          <div className="row w-100 my-2 mx-4 pl-3">
            <span className="small d-flex">
              <Icon className="mr-2" src={Block} data-testid="hide-from-toc-sequence-link-icon" />
              <span data-testid="hide-from-toc-sequence-link-text">
                {intl.formatMessage(messages.hiddenSequenceLink)}
              </span>
            </span>
          </div>
        )}
        <div className="row w-100 m-0 ml-3 pl-3">
          <small className="text-body pl-2">
            {due ? dueDateMessage : noDueDateMessage}
          </small>
        </div>
      </div>
    </li>
  );
};

SequenceLink.propTypes = {
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  first: PropTypes.bool.isRequired,
  sequence: PropTypes.shape().isRequired,
};

export default injectIntl(SequenceLink);
