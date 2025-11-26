import { renderHook, act } from '@testing-library/react';

import SidebarContext from '../../SidebarContext';
import { useSidebarFocusAndKeyboard } from './useSidebarFocusAndKeyboard';

const SIDEBAR_ID = 'test-sidebar';
const TRIGGER_SELECTOR = '.sidebar-trigger-btn';

describe('useSidebarFocusAndKeyboard', () => {
  let mockToggleSidebar;
  let mockQuerySelector;
  let mockContextValue;
  let triggerButtonMock;

  const getMockContext = (currentSidebar = null, shouldDisplayFullScreen = false) => ({
    toggleSidebar: mockToggleSidebar,
    shouldDisplayFullScreen,
    currentSidebar,
    courseId: 'test-course-id',
  });

  const renderHookWithContext = (contextValue, initialProps = {
    sidebarId: SIDEBAR_ID, triggerButtonSelector: TRIGGER_SELECTOR,
  }) => {
    const wrapper = ({ children }) => (
      <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>
    );
    return renderHook(
      (props) => useSidebarFocusAndKeyboard(props.sidebarId, props.triggerButtonSelector),
      { wrapper, initialProps },
    );
  };

  beforeEach(() => {
    mockToggleSidebar = jest.fn();
    triggerButtonMock = { focus: jest.fn() };

    mockQuerySelector = jest.spyOn(document, 'querySelector');
    mockQuerySelector.mockImplementation((selector) => {
      if (selector === TRIGGER_SELECTOR) {
        return triggerButtonMock;
      }
      return null;
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    mockQuerySelector.mockRestore();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Initial Focus (useEffect)', () => {
    it('should focus close button when sidebar opens (not fullscreen)', () => {
      mockContextValue = getMockContext(SIDEBAR_ID, false);
      const { result } = renderHookWithContext(mockContextValue);

      const mockCloseBtnFocus = jest.fn();
      act(() => {
        result.current.closeBtnRef.current = { focus: mockCloseBtnFocus };
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(mockCloseBtnFocus).toHaveBeenCalledTimes(1);
    });

    it('should focus back button when sidebar opens (fullscreen)', () => {
      mockContextValue = getMockContext(SIDEBAR_ID, true);
      const { result } = renderHookWithContext(mockContextValue);

      const mockBackBtnFocus = jest.fn();
      act(() => {
        result.current.backBtnRef.current = { focus: mockBackBtnFocus };
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(mockBackBtnFocus).toHaveBeenCalledTimes(1);
    });

    it('should not attempt focus if sidebar is not the current one', () => {
      mockContextValue = getMockContext('another-sidebar', false);
      const { result } = renderHookWithContext(mockContextValue);

      const mockCloseBtnFocus = jest.fn();
      const mockBackBtnFocus = jest.fn();
      act(() => {
        result.current.closeBtnRef.current = { focus: mockCloseBtnFocus };
        result.current.backBtnRef.current = { focus: mockBackBtnFocus };
      });

      act(() => {
        jest.runAllTimers();
      });

      expect(mockCloseBtnFocus).not.toHaveBeenCalled();
      expect(mockBackBtnFocus).not.toHaveBeenCalled();
    });
  });

  describe('handleClose', () => {
    it('should call toggleSidebar(null) and attempt to focus trigger button', () => {
      mockContextValue = getMockContext(SIDEBAR_ID);
      const { result } = renderHookWithContext(mockContextValue);

      act(() => {
        result.current.handleClose();
      });

      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
      expect(mockToggleSidebar).toHaveBeenCalledWith(null);

      act(() => {
        jest.runAllTimers();
      });

      expect(mockQuerySelector).toHaveBeenCalledWith(TRIGGER_SELECTOR);
      expect(triggerButtonMock.focus).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleKeyDown (Standard Close Button)', () => {
    let mockEvent;
    let mockOutlineTrigger;
    let mockPrevButton;
    let mockNextButton;

    beforeEach(() => {
      mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      mockOutlineTrigger = { focus: jest.fn(), disabled: false };
      mockPrevButton = { focus: jest.fn(), disabled: false };
      mockNextButton = { focus: jest.fn(), disabled: false };
    });

    it('should do nothing if key is not Tab', () => {
      mockContextValue = getMockContext(SIDEBAR_ID);
      const { result } = renderHookWithContext(mockContextValue);
      mockEvent.key = 'Enter';

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(triggerButtonMock.focus).not.toHaveBeenCalled();
    });

    it('should call focusSidebarTriggerBtn on Shift+Tab', () => {
      mockContextValue = getMockContext(SIDEBAR_ID);
      const { result } = renderHookWithContext(mockContextValue);
      mockEvent.shiftKey = true;

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      act(() => jest.runAllTimers());
      expect(triggerButtonMock.focus).toHaveBeenCalledTimes(1);
    });

    it('should attempt to focus elements sequentially on Tab', () => {
      mockContextValue = getMockContext(SIDEBAR_ID);
      const { result } = renderHookWithContext(mockContextValue);

      mockQuerySelector.mockImplementation((selector) => {
        if (selector === '#courseOutlineSidebarTrigger') {
          return mockOutlineTrigger;
        }
        if (selector === '.previous-button') {
          return mockPrevButton;
        }
        if (selector === '.next-button') {
          return mockNextButton;
        }

        return null;
      });

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockOutlineTrigger.focus).toHaveBeenCalledTimes(1);
      expect(mockPrevButton.focus).not.toHaveBeenCalled();
    });

    it('should allow default Tab if no elements are focused by tryFocusAndPreventDefault', () => {
      mockContextValue = getMockContext(SIDEBAR_ID);
      const { result } = renderHookWithContext(mockContextValue);

      mockQuerySelector.mockImplementation((selector) => {
        if (selector === TRIGGER_SELECTOR) {
          return triggerButtonMock;
        }
        return null;
      });

      act(() => {
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('handleBackBtnKeyDown (Fullscreen Back Button)', () => {
    let mockEvent;
    let mockCtaButton;

    beforeEach(() => {
      mockEvent = {
        key: '',
        shiftKey: false,
        preventDefault: jest.fn(),
      };
      mockCtaButton = { focus: jest.fn() };

      mockQuerySelector.mockImplementation((selector) => {
        if (selector === '.call-to-action-btn') {
          return mockCtaButton;
        }
        if (selector === TRIGGER_SELECTOR) {
          return triggerButtonMock;
        }
        return null;
      });
    });

    it('should call handleClose on Enter key', () => {
      mockContextValue = getMockContext(SIDEBAR_ID, true);
      const { result } = renderHookWithContext(mockContextValue);
      mockEvent.key = 'Enter';

      act(() => {
        result.current.handleBackBtnKeyDown(mockEvent);
      });

      expect(mockToggleSidebar).toHaveBeenCalledWith(null);
      act(() => jest.runAllTimers());
      expect(triggerButtonMock.focus).toHaveBeenCalledTimes(1);
    });

    it('should focus CTA button on Tab (no Shift)', () => {
      mockContextValue = getMockContext(SIDEBAR_ID, true);
      const { result } = renderHookWithContext(mockContextValue);
      mockEvent.key = 'Tab';
      mockEvent.shiftKey = false;

      act(() => {
        result.current.handleBackBtnKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockCtaButton.focus).toHaveBeenCalledTimes(1);
    });

    it('should focus itself (back button) on Shift+Tab', () => {
      mockContextValue = getMockContext(SIDEBAR_ID, true);
      const { result } = renderHookWithContext(mockContextValue);
      mockEvent.key = 'Tab';
      mockEvent.shiftKey = true;

      const mockBackBtnFocus = jest.fn();
      act(() => {
        result.current.backBtnRef.current = { focus: mockBackBtnFocus };
      });

      act(() => {
        result.current.handleBackBtnKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockBackBtnFocus).toHaveBeenCalledTimes(1);
    });

    it('should do nothing for other keys', () => {
      mockContextValue = getMockContext(SIDEBAR_ID, true);
      const { result } = renderHookWithContext(mockContextValue);
      mockEvent.key = 'ArrowUp';

      act(() => {
        result.current.handleBackBtnKeyDown(mockEvent);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockToggleSidebar).not.toHaveBeenCalled();
      expect(mockCtaButton.focus).not.toHaveBeenCalled();
    });
  });

  it('should return refs and handler functions', () => {
    mockContextValue = getMockContext();
    const { result } = renderHookWithContext(mockContextValue);

    expect(result.current.closeBtnRef).toBeDefined();
    expect(result.current.closeBtnRef.current).toBeNull();
    expect(result.current.backBtnRef).toBeDefined();
    expect(result.current.backBtnRef.current).toBeNull();
    expect(typeof result.current.handleClose).toBe('function');
    expect(typeof result.current.handleKeyDown).toBe('function');
    expect(typeof result.current.handleBackBtnKeyDown).toBe('function');
  });
});
