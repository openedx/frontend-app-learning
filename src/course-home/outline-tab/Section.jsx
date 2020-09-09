import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible, IconButton } from '@edx/paragon';
import { faCheckCircle as fasCheckCircle, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle as farCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SequenceLink from './SequenceLink';
import { useModel } from '../../generic/model-store';
import genericMessages from '../../generic/messages';
import messages from './messages';

function Section({
  courseId,
  expand,
  intl,
  section,
}) {
  const {
    complete,
    sequenceIds,
    title,
  } = section;
  const {
    courseBlocks: {
      sequences,
    },
  } = useModel('outline', courseId);

  const [open, setOpen] = useState(expand);

  useEffect(() => {
    setOpen(expand);
  }, [expand]);

  const sectionTitle = (
    <div>
      {complete ? (
        <FontAwesomeIcon
          icon={fasCheckCircle}
          className="float-left mt-1 text-success"
          aria-hidden="true"
          title={intl.formatMessage(messages.completedSection)}
        />
      ) : (
        <FontAwesomeIcon
          icon={farCheckCircle}
          className="float-left mt-1 text-gray-200"
          aria-hidden="true"
          title={intl.formatMessage(messages.incompleteSection)}
        />
      )}
      <div className="ml-3 pl-3 font-weight-bold">
        {title}
        <span className="sr-only">
          , {intl.formatMessage(complete ? messages.completedSection : messages.incompleteSection)}
        </span>
      </div>
    </div>
  );

  return (
    <Collapsible
      className="mb-2"
      styling="card-lg"
      title={sectionTitle}
      open={open}
      onToggle={() => { setOpen(!open); }}
      iconWhenClosed={(
        <IconButton
          alt={intl.formatMessage(messages.openSection)}
          icon={faPlus}
          onClick={() => { setOpen(true); }}
        />
      )}
      iconWhenOpen={(
        <IconButton
          alt={intl.formatMessage(genericMessages.close)}
          icon={faMinus}
          onClick={() => { setOpen(false); }}
        />
      )}
    >
      {sequenceIds.map((sequenceId, index) => (
        <SequenceLink
          key={sequenceId}
          id={sequenceId}
          courseId={courseId}
          sequence={sequences[sequenceId]}
          first={index === 0}
        />
      ))}
    </Collapsible>
  );
}

Section.propTypes = {
  courseId: PropTypes.string.isRequired,
  expand: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  section: PropTypes.shape().isRequired,
};

export default injectIntl(Section);
