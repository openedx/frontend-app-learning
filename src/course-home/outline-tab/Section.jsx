import React from 'react';
import PropTypes from 'prop-types';
import { Collapsible } from '@edx/paragon';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SequenceLink from './SequenceLink';
import { useModel } from '../../generic/model-store';

export default function Section({ courseId, section }) {
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

  const sectionTitle = (
    <div>
      {complete && <FontAwesomeIcon icon={faCheckCircle} className="float-left text-success mt-1" />}
      <div className="ml-4 font-weight-bold">{title}</div>
    </div>
  );

  return (
    <Collapsible className="mb-2" styling="card-lg" title={sectionTitle} defaultOpen>
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
  section: PropTypes.shape().isRequired,
};
