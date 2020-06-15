import React from 'react';
import PropTypes from 'prop-types';
import { Collapsible } from '@edx/paragon';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SequenceLink from './SequenceLink';
import { useModel } from '../model-store';

export default function Section({ courseId, title, sequenceIds }) {
  const {
    courseBlocks: {
      sequences,
    },
  } = useModel('outline', courseId);

  return (
    <Collapsible.Advanced className="collapsible-card mb-2">
      <Collapsible.Trigger className="collapsible-trigger d-flex align-items-start">
        <Collapsible.Visible whenClosed>
          <div style={{ minWidth: '1rem' }}>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </Collapsible.Visible>
        <Collapsible.Visible whenOpen>
          <div style={{ minWidth: '1rem' }}>
            <FontAwesomeIcon icon={faChevronDown} />
          </div>
        </Collapsible.Visible>
        <div className="ml-2 flex-grow-1">{title}</div>
      </Collapsible.Trigger>

      <Collapsible.Body className="collapsible-body">
        {sequenceIds.map((sequenceId) => (
          <SequenceLink
            key={sequenceId}
            id={sequenceId}
            courseId={courseId}
            title={sequences[sequenceId].title}
          />
        ))}
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
}

Section.propTypes = {
  courseId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  sequenceIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
