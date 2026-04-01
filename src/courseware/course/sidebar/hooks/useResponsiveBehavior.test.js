import { renderHook } from '@testing-library/react';
import { WIDGETS } from '@src/constants';
import { useResponsiveBehavior } from './useResponsiveBehavior';

import { setSidebarId, isOutlineSidebarCollapsed } from '../utils/storage';

jest.mock('../utils/storage', () => ({
  setSidebarId: jest.fn(),
  isOutlineSidebarCollapsed: jest.fn(),
}));

const courseId = 'course-123';

function buildParams(overrides = {}) {
  return {
    shouldDisplaySidebarOpen: true,
    currentSidebar: null,
    setCurrentSidebar: jest.fn(),
    getFirstAvailablePanel: jest.fn(() => 'DISCUSSIONS'),
    courseId,
    hasUserToggledRef: { current: false },
    ...overrides,
  };
}

describe('useResponsiveBehavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isOutlineSidebarCollapsed.mockReturnValue(false);
  });

  it('does nothing when user has manually toggled', () => {
    const params = buildParams({ hasUserToggledRef: { current: true } });
    renderHook(() => useResponsiveBehavior(params));

    expect(params.setCurrentSidebar).not.toHaveBeenCalled();
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

  it('opens first available right panel on desktop when no sidebar is open', () => {
    const params = buildParams();
    renderHook(() => useResponsiveBehavior(params));

    expect(params.setCurrentSidebar).toHaveBeenCalledWith('DISCUSSIONS');
    expect(setSidebarId).toHaveBeenCalledWith(courseId, 'DISCUSSIONS');
  });

  it('opens COURSE_OUTLINE when no right panels available and outline is not collapsed', () => {
    const params = buildParams({ getFirstAvailablePanel: jest.fn(() => null) });
    renderHook(() => useResponsiveBehavior(params));

    expect(params.setCurrentSidebar).toHaveBeenCalledWith(WIDGETS.COURSE_OUTLINE);
    expect(setSidebarId).toHaveBeenCalledWith(courseId, WIDGETS.COURSE_OUTLINE);
  });

  it('does nothing when no right panels and outline is collapsed', () => {
    isOutlineSidebarCollapsed.mockReturnValue(true);
    const params = buildParams({ getFirstAvailablePanel: jest.fn(() => null) });
    renderHook(() => useResponsiveBehavior(params));

    expect(params.setCurrentSidebar).not.toHaveBeenCalled();
  });
});
