import React from 'react';
import { useModel } from '@src/generic/model-store';

import { modelKeys } from '../constants';

/**
 * @return {bool} should the honor code be displayed?
 */
const useShouldDisplayHonorCode = ({ id, courseId }) => {
  const [shouldDisplay, setShouldDisplay] = React.useState(false);

  const { graded } = useModel(modelKeys.units, id);
  const { userNeedsIntegritySignature } = useModel(modelKeys.coursewareMeta, courseId);

  React.useEffect(() => {
    setShouldDisplay(userNeedsIntegritySignature && graded);
  }, [setShouldDisplay, userNeedsIntegritySignature]);

  return shouldDisplay;
};

export default useShouldDisplayHonorCode;
