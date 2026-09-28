import { renderHook } from '@testing-library/react';
import { useUnit } from '@src/courseware/data/apiHooks';
import { useModel } from '@src/generic/model-store';
import useShouldDisplayHonorCode from './useShouldDisplayHonorCode';
import { modelKeys } from '../constants';

jest.mock('@src/courseware/data/apiHooks', () => ({
  useUnit: jest.fn(),
}));
jest.mock('@src/generic/model-store', () => ({
  useModel: jest.fn(),
}));

const props = {
  id: 'test-id',
  courseId: 'test-course-id',
  sequenceId: 'test-sequence-id',
};

const mockModels = (graded, userNeedsIntegritySignature) => {
  useUnit.mockReturnValue({ data: { graded } });
  useModel.mockReturnValue({ userNeedsIntegritySignature });
};

describe('useShouldDisplayHonorCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads the unit from its sequence and the courseware metadata model', () => {
    mockModels(true, true);

    renderHook(() => useShouldDisplayHonorCode(props));
    expect(useUnit).toHaveBeenCalledWith('test-sequence-id', props.id);
    expect(useModel).toHaveBeenCalledWith(modelKeys.coursewareMeta, props.courseId);
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

  it('does not display while the unit is not loaded', () => {
    useUnit.mockReturnValue({ data: undefined });
    useModel.mockReturnValue({ userNeedsIntegritySignature: true });

    const { result } = renderHook(() => useShouldDisplayHonorCode(props));
    expect(result.current).toBeUndefined();
  });

  it('should return true when both userNeedsIntegritySignature and graded are true', () => {
    mockModels(true, true);

    const { result } = renderHook(() => useShouldDisplayHonorCode(props));
    expect(result.current).toBe(true);
  });
});
