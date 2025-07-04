import { renderHook } from '@testing-library/react';
import { useModel } from '@src/generic/model-store';
import useShouldDisplayHonorCode from './useShouldDisplayHonorCode';
import { modelKeys } from '../constants';

jest.mock('@src/generic/model-store', () => ({
  useModel: jest.fn(),
}));

const props = {
  id: 'test-id',
  courseId: 'test-course-id',
};

const mockModels = (graded, userNeedsIntegritySignature) => {
  useModel.mockImplementation((key) => (
    (key === modelKeys.units) ? { graded } : { userNeedsIntegritySignature }
  ));
};

describe('useShouldDisplayHonorCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when userNeedsIntegritySignature is false', () => {
    mockModels(true, false);

    const { result } = renderHook(() => useShouldDisplayHonorCode(props));
    expect(result.current).toBe(false);
  });

  it('should return false when graded is false', () => {
    mockModels(false, true);

    const { result } = renderHook(() => useShouldDisplayHonorCode(props));
    expect(result.current).toBe(false);
  });

  it('should return true when both userNeedsIntegritySignature and graded are true', () => {
    mockModels(true, true);

    const { result } = renderHook(() => useShouldDisplayHonorCode(props));
    expect(result.current).toBe(true);
  });
});
