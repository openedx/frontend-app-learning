import React from 'react';
import { useCoursewareMetadata, useUnit } from '@src/courseware/data/apiHooks';

/**
 * @return {bool} should the honor code be displayed?
 */
const useShouldDisplayHonorCode = ({ id, courseId, sequenceId }) => {
  const [shouldDisplay, setShouldDisplay] = React.useState(false);

  const { graded } = useUnit(sequenceId, id).data ?? {};
  const userNeedsIntegritySignature = (
    useCoursewareMetadata(courseId, { enabled: false }).data?.userNeedsIntegritySignature
  );

  React.useEffect(() => {
    setShouldDisplay(userNeedsIntegritySignature && graded);
  }, [setShouldDisplay, userNeedsIntegritySignature]);

  return shouldDisplay;
};

export default useShouldDisplayHonorCode;
