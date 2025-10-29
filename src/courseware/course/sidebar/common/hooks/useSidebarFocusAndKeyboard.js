import {
  useCallback, useContext, useEffect, useRef,
} from 'react';
import { tryFocusAndPreventDefault } from '../../utils';
import SidebarContext from '../../SidebarContext';

export const useSidebarFocusAndKeyboard = (sidebarId, triggerButtonSelector = '.sidebar-trigger-btn') => {
  const {
    toggleSidebar,
    shouldDisplayFullScreen,
    currentSidebar,
  } = useContext(SidebarContext);

  const closeBtnRef = useRef(null);
  const backBtnRef = useRef(null);
  const isOpen = currentSidebar === sidebarId;

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        if (shouldDisplayFullScreen && backBtnRef.current) {
          backBtnRef.current.focus();
        } else if (closeBtnRef.current) {
          closeBtnRef.current.focus();
        }
      });
    }
  }, [isOpen, shouldDisplayFullScreen]);

  const focusSidebarTriggerBtn = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const sidebarTriggerBtn = document.querySelector(triggerButtonSelector);
        if (sidebarTriggerBtn) {
          sidebarTriggerBtn.focus();
        }
      });
    });
  }, [triggerButtonSelector]);

  const handleClose = useCallback(() => {
    if (toggleSidebar) {
      toggleSidebar(null);
    }
    focusSidebarTriggerBtn();
  }, [toggleSidebar, focusSidebarTriggerBtn]);

  /**
   * Handles Tab key navigation when focus is on the standard sidebar close button.
   * Implements the logic for moving focus out of the sidebar to specific elements
   * on the main page in a predefined sequence, or back to the trigger button on Shift+Tab.
   *
   * @param {KeyboardEvent} event - The keyboard event object.
   */
  const handleKeyDown = useCallback((event) => {
    if (event.key !== 'Tab') {
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab
      event.preventDefault();
      focusSidebarTriggerBtn();
    } else {
      // Tab
      if (tryFocusAndPreventDefault(event, '#courseOutlineSidebarTrigger')) {
        return;
      }
      if (tryFocusAndPreventDefault(event, '.previous-button')) {
        return;
      }
      tryFocusAndPreventDefault(event, '.next-button');
    }
  }, [focusSidebarTriggerBtn]);

  const handleBackBtnKeyDown = useCallback((event) => {
    const { key, shiftKey } = event;

    switch (key) {
      case 'Enter':
        handleClose();
        break;
      case 'Tab': {
        const ctaButton = document.querySelector('.call-to-action-btn');
        if (!shiftKey && ctaButton) {
          event.preventDefault();
          ctaButton.focus();
        } else if (shiftKey) {
          event.preventDefault();
          backBtnRef.current?.focus();
        }
        break;
      }
      default:
        break;
    }
  }, [handleClose, backBtnRef]);

  return {
    closeBtnRef,
    backBtnRef,
    handleClose,
    handleKeyDown,
    handleBackBtnKeyDown,
  };
};
