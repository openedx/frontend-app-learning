import React from 'react';

import { logError } from '@edx/frontend-platform/logging';
import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils';
import { getExamAccess, fetchExamAccess, isExam } from '@edx/frontend-lib-special-exams';

export const stateKeys = StrictDict({
  accessToken: 'accessToken',
  blockAccess: 'blockAccess',
});

const useExamAccess = ({
  id,
}) => {
  const [accessToken, setAccessToken] = useKeyedState(stateKeys.accessToken, '');
  const [blockAccess, setBlockAccess] = useKeyedState(stateKeys.blockAccess, isExam());
  React.useEffect(() => {
    if (isExam()) {
      fetchExamAccess()
        .finally(() => {
          const examAccess = getExamAccess();
          setAccessToken(examAccess);
          setBlockAccess(false);
        })
        .catch((error) => {
          logError(error);
        });
    }
  }, [id]);

  return {
    blockAccess,
    accessToken,
  };
};

export default useExamAccess;
