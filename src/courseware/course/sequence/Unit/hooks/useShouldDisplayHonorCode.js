import React from 'react';

import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils/dist';
import { useModel } from '@src/generic/model-store';

import { modelKeys } from '../constants';

export const stateKeys = StrictDict({
  shouldDisplay: 'shouldDisplay',
});

/**
 * @return {bool} should the honor code be displayed?
 */
const useShouldDisplayHonorCode = ({ id, courseId }) => {
  const [shouldDisplay, setShouldDisplay] = useKeyedState(stateKeys.shouldDisplay, false);

  const { graded } = useModel(modelKeys.units, id);
  const { userNeedsIntegritySignature } = useModel(modelKeys.coursewareMeta, courseId);

  React.useEffect(() => {
    setShouldDisplay(userNeedsIntegritySignature && graded);
  }, [setShouldDisplay, userNeedsIntegritySignature]);

  return shouldDisplay;
};

export default useShouldDisplayHonorCode;
