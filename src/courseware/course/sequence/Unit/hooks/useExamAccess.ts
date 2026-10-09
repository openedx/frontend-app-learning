import { useExamAccessToken, useIsExam } from '@edx/frontend-lib-special-exams';

const useExamAccess = () => {
  const isExam = useIsExam();
  const { accessToken, isPending } = useExamAccessToken();
  return { blockAccess: isExam && isPending, accessToken };
};

export default useExamAccess;
