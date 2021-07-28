import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import EffortEstimate from '../../../../shared/effort-estimate';
import { sequenceIdsSelector } from '../../../data';
import { useModel } from '../../../../generic/model-store';

import messages from './messages';

// This component exists to peek ahead at the next sequence and grab its estimated effort.
// If we should be showing the next sequence's effort, we display the title and effort instead of "Next".

function UnitNavigationEffortEstimate({
  children,
  intl,
  sequenceId,
  unitId,
}) {
  const sequenceIds = useSelector(sequenceIdsSelector);
  const sequenceIndex = sequenceIds.indexOf(sequenceId);
  const nextSequenceId = sequenceIndex < sequenceIds.length - 1 ? sequenceIds[sequenceIndex + 1] : null;
  const sequence = useModel('sequences', sequenceId);
  const nextSequence = useModel('sequences', nextSequenceId);

  if (!sequence || !nextSequence) {
    return children;
  }

  const isLastUnitInSequence = sequence.unitIds.indexOf(unitId) === sequence.unitIds.length - 1;
  if (!isLastUnitInSequence) {
    return children;
  }

  // If we don't have info to show for the next sequence, just bail
  if (!nextSequence.effortActivities && !nextSequence.effortTime) {
    return children;
  }

  // Note: we don't use `children` here - we replace it with the next sequence's title.
  return (
    <div className="d-inline-block text-wrap">
      {intl.formatMessage(messages.nextUpButton, { title: nextSequence.title })}
      <EffortEstimate className="d-block mt-1" block={nextSequence} />
    </div>
  );
}

UnitNavigationEffortEstimate.propTypes = {
  children: PropTypes.node,
  intl: intlShape.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
};

UnitNavigationEffortEstimate.defaultProps = {
  children: null,
  unitId: null,
};

export default injectIntl(UnitNavigationEffortEstimate);
