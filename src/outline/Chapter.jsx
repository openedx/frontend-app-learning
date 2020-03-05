import React from 'react';
import PropTypes from 'prop-types';
import { Collapsible } from '@edx/paragon';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SequenceLink from './SequenceLink';
import { courseBlocksShape } from '../data/course-blocks';

export default function Chapter({ id, courseUsageKey, models }) {
  const { displayName, children } = models[id];
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
        <div className="ml-2 flex-grow-1">{displayName}</div>
      </Collapsible.Trigger>

      <Collapsible.Body className="collapsible-body">
        {children.map((sequenceId) => (
          <SequenceLink
            key={sequenceId}
            id={sequenceId}
            courseUsageKey={courseUsageKey}
            models={models}
          />
        ))}
      </Collapsible.Body>
    </Collapsible.Advanced>
  );
}

Chapter.propTypes = {
  id: PropTypes.string.isRequired,
  courseUsageKey: PropTypes.string.isRequired,
  models: courseBlocksShape.isRequired,
};
