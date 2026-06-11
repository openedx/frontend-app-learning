import { renderHook } from '@testing-library/react';
import { WIDGETS } from '@src/constants';
import { useResponsiveBehavior } from './useResponsiveBehavior';

import { setSidebarId, isSidebarClosedByUser } from '../utils/storage';

jest.mock('../utils/storage', () => ({
  setSidebarId: jest.fn(),
  isSidebarClosedByUser: jest.fn(),
}));

const courseId = 'course-123';

function buildParams(overrides = {}) {
  return {
    shouldDisplaySidebarOpen: true,
    currentSidebar: null,
    setCurrentSidebar: jest.fn(),
    courseId,
    hasUserToggledRef: { current: false },
    ...overrides,
  };
}

describe('useResponsiveBehavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isSidebarClosedByUser.mockReturnValue(false);
  });

  it('does nothing when user has manually toggled', () => {
    const params = buildParams({ hasUserToggledRef: { current: true } });
    renderHook(() => useResponsiveBehavior(params));

    expect(params.setCurrentSidebar).not.toHaveBeenCalled();
  });

  it('does nothing when sidebar was closed by user', () => {
    isSidebarClosedByUser.mockReturnValue(true);
    const params = buildParams();
    renderHook(() => useResponsiveBehavior(params));

    expect(params.setCurrentSidebar).not.toHaveBeenCalled();
    expect(setSidebarId).not.toHaveBeenCalled();
  });

  it('does nothing when sidebar is already open', () => {
    const params = buildParams({ currentSidebar: 'DISCUSSIONS' });
    renderHook(() => useResponsiveBehavior(params));

    expect(params.setCurrentSidebar).not.toHaveBeenCalled();
  });

  it('does nothing when shouldDisplaySidebarOpen is false', () => {
    const params = buildParams({ shouldDisplaySidebarOpen: false });
    renderHook(() => useResponsiveBehavior(params));

    expect(params.setCurrentSidebar).not.toHaveBeenCalled();
  });

  it('opens COURSE_OUTLINE on desktop when no sidebar is open', () => {
    const params = buildParams();
    renderHook(() => useResponsiveBehavior(params));

    expect(params.setCurrentSidebar).toHaveBeenCalledWith(WIDGETS.COURSE_OUTLINE);
    expect(setSidebarId).toHaveBeenCalledWith(courseId, WIDGETS.COURSE_OUTLINE);
  });
});
