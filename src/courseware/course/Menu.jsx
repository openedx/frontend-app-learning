import React, {
  useState, useCallback, useRef, useEffect,
} from 'react';
import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';

export function MenuTrigger({ tag, className, ...attributes }) {
  return React.createElement(tag, {
    className: `menu-trigger ${className}`,
    ...attributes,
  });
}
MenuTrigger.propTypes = {
  tag: PropTypes.string,
  className: PropTypes.string,
};
MenuTrigger.defaultProps = {
  tag: 'div',
  className: null,
};
const MenuTriggerType = (<MenuTrigger />).type;

export function MenuContent({ tag, className, ...attributes }) {
  return React.createElement(tag, {
    className: ['menu-content', className].join(' '),
    ...attributes,
  });
}
MenuContent.propTypes = {
  tag: PropTypes.string,
  className: PropTypes.string,
};
MenuContent.defaultProps = {
  tag: 'div',
  className: null,
};

export function Menu({
  className,
  children,
  tag,
  transitionTimeout,
  transitionClassName,
  respondToPointerEvents,
  onOpen,
  onClose,
  closeOnDocumentClick,
  ...attributes
}) {
  const [expanded, setExpanded] = useState(false);
  const menu = useRef(null);

  const open = useCallback(() => {
    if (onOpen) {
      onOpen();
    }
    setExpanded(true);
  }, [onOpen]);

  const close = useCallback(() => {
    if (onClose) {
      onClose();
    }
    setExpanded(false);
  }, [onClose]);

  const toggle = useCallback(() => {
    if (expanded) {
      close();
    } else {
      open();
    }
  }, [expanded]);

  const onDocumentClick = useCallback((e) => {
    if (!closeOnDocumentClick) {
      return;
    }

    const clickIsInMenu = menu.current === e.target || menu.current.contains(e.target);
    if (clickIsInMenu) {
      return;
    }

    close();
  }, [closeOnDocumentClick]);

  useEffect(() => {
    if (expanded) {
      // Listen to touchend and click events to ensure the menu
    // can be closed on mobile, pointer, and mixed input devices
      document.addEventListener('touchend', onDocumentClick, true);
      document.addEventListener('click', onDocumentClick, true);
    } else {
      document.removeEventListener('touchend', onDocumentClick, true);
      document.removeEventListener('click', onDocumentClick, true);
    }
    return () => {
      document.removeEventListener('touchend', onDocumentClick, true);
      document.removeEventListener('click', onDocumentClick, true);
    };
  }, [expanded]);

  const onTriggerClick = useCallback((e) => {
    // Let the browser follow the link of the trigger if the menu
    // is already expanded and the trigger has an href attribute
    if (expanded && e.target.getAttribute('href')) {
      return;
    }

    e.preventDefault();
    toggle();
  }, []);

  const onMouseEnter = useCallback(() => {
    if (!respondToPointerEvents) { return; }
    open();
  }, [respondToPointerEvents]);

  const onMouseLeave = useCallback(() => {
    if (!respondToPointerEvents) { return; }
    close();
  }, [respondToPointerEvents]);

  const getFocusableElements = useCallback(() => menu.current.querySelectorAll('button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'), []);

  const focusNext = useCallback(() => {
    const focusableElements = Array.from(getFocusableElements());
    const activeIndex = focusableElements.indexOf(document.activeElement);
    const nextIndex = (activeIndex + 1) % focusableElements.length;
    focusableElements[nextIndex].focus();
  }, []);

  const focusPrevious = useCallback(() => {
    const focusableElements = Array.from(getFocusableElements());
    const activeIndex = focusableElements.indexOf(document.activeElement);
    const previousIndex = (activeIndex || focusableElements.length) - 1;
    focusableElements[previousIndex].focus();
  }, []);

  const onKeyDown = useCallback((e) => {
    if (!expanded) {
      return;
    }
    switch (e.key) {
      case 'Escape': {
        e.preventDefault();
        e.stopPropagation();
        getFocusableElements()[0].focus();
        close();
        break;
      }
      case 'Enter': {
        // Using focusable elements instead of a ref to the trigger
        // because Hyperlink and Button can handle refs as functional components
        if (document.activeElement === getFocusableElements()[0]) {
          e.preventDefault();
          toggle();
        }
        break;
      }
      case 'Tab': {
        e.preventDefault();
        if (e.shiftKey) {
          focusPrevious();
        } else {
          focusNext();
        }
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        focusNext();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        focusPrevious();
        break;
      }
      default:
    }
  }, [expanded]);

  useEffect(() => () => {
    // Call onClose callback when unmounting and open
    if (expanded && onClose) {
      onClose();
    }
  }, []);

  const wrappedChildren = React.Children.map(children, (child) => {
    if (child.type === MenuTriggerType) {
      return React.cloneElement(child, {
        onClick: onTriggerClick,
        'aria-haspopup': 'menu',
        'aria-expanded': expanded,
      });
    }
    return (
      <CSSTransition
        in={expanded}
        timeout={transitionTimeout}
        classNames={transitionClassName}
        unmountOnExit
      >
        {child}
      </CSSTransition>
    );
  });

  const rootClassName = expanded ? 'menu expanded' : 'menu';

  return React.createElement(tag, {
    className: `${rootClassName} ${className}`,
    ref: menu,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    ...attributes,
  }, wrappedChildren);
}


Menu.propTypes = {
  tag: PropTypes.string,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  closeOnDocumentClick: PropTypes.bool,
  respondToPointerEvents: PropTypes.bool,
  className: PropTypes.string,
  transitionTimeout: PropTypes.number,
  transitionClassName: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

Menu.defaultProps = {
  tag: 'div',
  className: null,
  onClose: null,
  onOpen: null,
  respondToPointerEvents: false,
  closeOnDocumentClick: true,
  transitionTimeout: 250,
  transitionClassName: 'menu-content',
};
