import React from 'react';
import { useUnit } from '@src/courseware/data/apiHooks';
import { useModel } from '@src/generic/model-store';

import { modelKeys } from '../constants';

/**
 * @return {bool} should the honor code be displayed?
 */
const useShouldDisplayHonorCode = ({ id, courseId, sequenceId }) => {
  const [shouldDisplay, setShouldDisplay] = React.useState(false);

  const { graded } = useUnit(sequenceId, id).data ?? {};
  const { userNeedsIntegritySignature } = useModel(modelKeys.coursewareMeta, courseId);

  React.useEffect(() => {
    setShouldDisplay(userNeedsIntegritySignature && graded);
  }, [setShouldDisplay, userNeedsIntegritySignature]);

  return shouldDisplay;
};

export default useShouldDisplayHonorCode;
