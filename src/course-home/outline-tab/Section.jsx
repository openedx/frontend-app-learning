import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible, IconButton } from '@edx/paragon';
import { faCheckCircle as fasCheckCircle, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle as farCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SequenceLink from './SequenceLink';
import { useModel } from '../../generic/model-store';

import genericMessages from '../../generic/messages';
import { useScrollTo } from './hooks';
import messages from './messages';
import './Section.scss';

const Section = ({
  courseId,
  defaultOpen,
  expand,
  intl,
  section,
}) => {
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
  // A section or subsection is selected by its id being the location hash part.
  // location.hash will contain an initial # sign, so remove it here.
  const hashValue = useLocation().hash.substring(1);
  const selected = hashValue === section.id;

  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(expand);
  }, [expand]);

  useEffect(() => {
    setOpen(defaultOpen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sectionRef = useScrollTo(selected);

  const sectionTitle = (
    <div className="row w-100 m-0">
      <div className="col-auto p-0">
        {complete ? (
          <FontAwesomeIcon
            icon={fasCheckCircle}
            fixedWidth
            className="float-left mt-1 text-success"
            aria-hidden="true"
            title={intl.formatMessage(messages.completedSection)}
          />
        ) : (
          <FontAwesomeIcon
            icon={farCheckCircle}
            fixedWidth
            className="float-left mt-1 text-gray-400"
            aria-hidden="true"
            title={intl.formatMessage(messages.incompleteSection)}
          />
        )}
      </div>
      <div className="col-10 ml-3 p-0 font-weight-bold text-dark-500">
        <span className="align-middle">{title}</span>
        <span className="sr-only">
          , {intl.formatMessage(complete ? messages.completedSection : messages.incompleteSection)}
        </span>
      </div>
    </div>
  );

  return (
    <li ref={sectionRef}>
      <Collapsible
        className={classNames('mb-2 section', { 'section-selected': selected })}
        styling="card-lg"
        title={sectionTitle}
        open={open}
        onToggle={() => { setOpen(!open); }}
        iconWhenClosed={(
          <IconButton
            alt={intl.formatMessage(messages.openSection)}
            icon={faPlus}
            onClick={() => { setOpen(true); }}
            size="sm"
          />
        )}
        iconWhenOpen={(
          <IconButton
            alt={intl.formatMessage(genericMessages.close)}
            icon={faMinus}
            onClick={() => { setOpen(false); }}
            size="sm"
          />
        )}
      >
        <ol className="list-unstyled">
          {sequenceIds.map((sequenceId, index) => (
            <SequenceLink
              key={sequenceId}
              id={sequenceId}
              courseId={courseId}
              sequence={sequences[sequenceId]}
              first={index === 0}
              last={index === (sequenceIds.length - 1)}
              selected={hashValue === sequenceId}
            />
          ))}
        </ol>
      </Collapsible>
    </li>
  );
};

Section.propTypes = {
  courseId: PropTypes.string.isRequired,
  defaultOpen: PropTypes.bool.isRequired,
  expand: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  section: PropTypes.shape().isRequired,
};

export default injectIntl(Section);
