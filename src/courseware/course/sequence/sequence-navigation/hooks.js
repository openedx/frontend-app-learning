/* eslint-disable import/prefer-default-export */

import { useSelector } from 'react-redux';
import { useModel } from '../../../../generic/model-store';
import { sequenceIdsSelector } from '../../../data/selectors';

export function useSequenceNavigationMetadata(currentSequenceId, currentUnitId) {
  const sequenceIds = useSelector(sequenceIdsSelector);
  const sequence = useModel('sequences', currentSequenceId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);

  // If we don't know the sequence and unit yet, then assume no.
  if (courseStatus !== 'loaded' || !currentSequenceId || !currentUnitId) {
    return { isFirstUnit: false, isLastUnit: false };
  }
  const isFirstSequence = sequenceIds.indexOf(currentSequenceId) === 0;
  const isFirstUnitInSequence = sequence.unitIds.indexOf(currentUnitId) === 0;
  const isFirstUnit = isFirstSequence && isFirstUnitInSequence;
  const isLastSequence = sequenceIds.indexOf(currentSequenceId) === sequenceIds.length - 1;
  const isLastUnitInSequence = sequence.unitIds.indexOf(currentUnitId) === sequence.unitIds.length - 1;
  const isLastUnit = isLastSequence && isLastUnitInSequence;

  return { isFirstUnit, isLastUnit };
}
