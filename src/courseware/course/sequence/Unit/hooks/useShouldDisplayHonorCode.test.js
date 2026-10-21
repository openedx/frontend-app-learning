import { renderHook } from '@testing-library/react';
import { useCoursewareMetadata, useUnit } from '@src/courseware/data/apiHooks';
import useShouldDisplayHonorCode from './useShouldDisplayHonorCode';

jest.mock('@src/courseware/data/apiHooks', () => ({
  useCoursewareMetadata: jest.fn(),
  useUnit: jest.fn(),
}));

const props = {
  id: 'test-id',
  courseId: 'test-course-id',
  sequenceId: 'test-sequence-id',
};

const mockModels = (graded, userNeedsIntegritySignature) => {
  useUnit.mockReturnValue({ data: { graded } });
  useCoursewareMetadata.mockReturnValue({ data: { userNeedsIntegritySignature } });
};

describe('useShouldDisplayHonorCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads the unit from its sequence and the courseware metadata query', () => {
    mockModels(true, true);

    renderHook(() => useShouldDisplayHonorCode(props));
    expect(useUnit).toHaveBeenCalledWith('test-sequence-id', props.id);
    expect(useCoursewareMetadata).toHaveBeenCalledWith(props.courseId, { enabled: false });
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
    useCoursewareMetadata.mockReturnValue({ data: { userNeedsIntegritySignature: true } });

    const { result } = renderHook(() => useShouldDisplayHonorCode(props));
    expect(result.current).toBeUndefined();
  });

  it('should return true when both userNeedsIntegritySignature and graded are true', () => {
    mockModels(true, true);

    const { result } = renderHook(() => useShouldDisplayHonorCode(props));
    expect(result.current).toBe(true);
  });
});
