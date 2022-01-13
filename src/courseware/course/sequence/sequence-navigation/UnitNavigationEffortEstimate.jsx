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

/**
 * Note: this component is basically ignored and just acts as a pass-through to children components right now because
 * effort estimation is no longer attached to the sequence model. It used to be attached, via the LMS blocks API and
 * its block transformers. But as part of the effort to remove reliance on modulestore blocks on the LMS side, we
 * stopped calling that API and we lost effort estimation in the deal.
 *
 * See https://openedx.atlassian.net/browse/AA-930 for the initiative to refactor Effort Estimation to avoid the
 * modulestore, which would allow us to revive the usefulness of this component again.
 */

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

  if (!sequence || Object.keys(sequence).length === 0 || !nextSequence || Object.keys(nextSequence).length === 0) {
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
