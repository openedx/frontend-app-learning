import React from 'react';

import { logError } from '@edx/frontend-platform/logging';
import { useExamAccessToken, useFetchExamAccessToken, useIsExam } from '@edx/frontend-lib-special-exams';

const useExamAccess = ({
  id,
}) => {
  const isExam = useIsExam();
  const [blockAccess, setBlockAccess] = React.useState(isExam);

  const fetchExamAccessToken = useFetchExamAccessToken();

  // NOTE: We cannot use this hook in the useEffect hook below to grab the updated exam access token in the finally
  //       block, due to the rules of hooks. Instead, we get the value of the exam access token from a call to
  //       the hook below.
  //       When the fetchExamAccessToken call completes, the useExamAccess hook will re-run
  //       (due to a change to the Redux store, and, thus, a change to the context), at which point the updated
  //       exam access token will be fetched via the useExamAccessToken hook call below.
  //       The important detail is that there should never be a return value (false, '').
  const examAccessToken = useExamAccessToken();

  React.useEffect(() => {
    if (isExam) {
      fetchExamAccessToken()
        .finally(() => {
          setBlockAccess(false);
        })
        .catch((error) => {
          logError(error);
        });
    }
  }, [id, isExam]);

  return {
    blockAccess,
    accessToken: examAccessToken,
  };
};

export default useExamAccess;
