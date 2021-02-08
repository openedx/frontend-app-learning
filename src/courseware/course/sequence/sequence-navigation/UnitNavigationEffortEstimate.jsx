import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import EffortEstimate from '../../../../shared/effort-estimate';
import { sequenceIdsSelector } from '../../../data';
import { useModel } from '../../../../generic/model-store';

// This component exists to peek ahead at the next subsection or section and grab its estimated effort.
// If we should be showing the next block's effort, we display the title and effort instead of "Next".
// This code currently tries to handle both section and subsection estimates. But once AA-659 happens, it can be
// simplified to one or the other code path.

function UnitNavigationEffortEstimate({ children, sequenceId, unitId }) {
  const sequenceIds = useSelector(sequenceIdsSelector);
  const sequenceIndex = sequenceIds.indexOf(sequenceId);
  const nextSequenceId = sequenceIndex < sequenceIds.length - 1 ? sequenceIds[sequenceIndex + 1] : null;
  const sequence = useModel('sequences', sequenceId);
  const nextSequence = useModel('sequences', nextSequenceId);
  const nextSection = useModel('sections', nextSequence ? nextSequence.sectionId : null);

  if (!sequence || !nextSequence) {
    return children;
  }

  const isLastUnitInSequence = sequence.unitIds.indexOf(unitId) === sequence.unitIds.length - 1;
  if (!isLastUnitInSequence) {
    return children;
  }

  let blockToShow = nextSequence;
  // The experimentation code currently only sets effort on either sequences, sections, or nothing. If we don't have
  // sequence info, we are either doing sections or nothing. Let's look into it.
  if (!nextSequence.effortActivities && !nextSequence.effortTime) {
    if (!nextSection.effortActivities && !nextSection.effortTime) {
      return children; // control group - no effort estimates at all
    }

    // Are we at a section border? If so, let's show the next section's effort estimates
    if (sequence.sectionId !== nextSequence.sectionId) {
      blockToShow = nextSection;
    }
  }

  // Note: we don't use `children` here - we replace it with the next section name.
  // AA-659: remember to add a translation for Next Up
  return (
    <div className="d-inline-block text-wrap">
      Next Up: {blockToShow.title}
      <EffortEstimate className="d-block mt-1" block={blockToShow} />
    </div>
  );
}

UnitNavigationEffortEstimate.propTypes = {
  children: PropTypes.node,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
};

UnitNavigationEffortEstimate.defaultProps = {
  children: null,
  unitId: null,
};

export default UnitNavigationEffortEstimate;
