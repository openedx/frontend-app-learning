import { renderHook } from '@testing-library/react';
import { useExamAccessToken, useIsExam } from '@edx/frontend-lib-special-exams';

import useExamAccess from './useExamAccess';

jest.mock('@edx/frontend-lib-special-exams', () => ({
  useExamAccessToken: jest.fn(),
  useIsExam: jest.fn(),
}));

const mockIsExam = useIsExam as jest.Mock;
const mockExamAccessToken = useExamAccessToken as jest.Mock;

describe('useExamAccess', () => {
  it('does not block a unit that is not in an exam', () => {
    mockIsExam.mockReturnValue(false);
    mockExamAccessToken.mockReturnValue({ accessToken: '', isPending: false });

    expect(renderHook(() => useExamAccess()).result.current).toEqual({ blockAccess: false, accessToken: '' });
  });

  it('blocks an exam unit while its access token is pending', () => {
    mockIsExam.mockReturnValue(true);
    mockExamAccessToken.mockReturnValue({ accessToken: '', isPending: true });

    expect(renderHook(() => useExamAccess()).result.current).toEqual({ blockAccess: true, accessToken: '' });
  });

  it('unblocks an exam unit with its access token once it arrives', () => {
    mockIsExam.mockReturnValue(true);
    mockExamAccessToken.mockReturnValue({ accessToken: 'test-access-token', isPending: false });

    expect(renderHook(() => useExamAccess()).result.current)
      .toEqual({ blockAccess: false, accessToken: 'test-access-token' });
  });

  it('does not block an exam unit that needs no token', () => {
    mockIsExam.mockReturnValue(true);
    mockExamAccessToken.mockReturnValue({ accessToken: '', isPending: false });

    expect(renderHook(() => useExamAccess()).result.current).toEqual({ blockAccess: false, accessToken: '' });
  });
});
