import React, {
  useLayoutEffect, useRef, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import useWindowSize from './useWindowSize';

export default function Tabs({ children, className, ...attrs }) {
  const [cutOffIndex, setCutOffIndex] = useState(React.Children.count(children));
  const windowSize = useWindowSize();
  const navElementRef = useRef(null);
  const tabsRectRef = useRef({});
  const overflowEl = useRef(null);

  // eslint-disable-next-line prefer-arrow-callback
  useLayoutEffect(function findCutOffIndex() {
    const tabsRect = navElementRef.current.getBoundingClientRect();

    // No-op if the width is unchanged.
    // (Assumes tabs themselves don't change count or width).
    if (!tabsRect.width === tabsRectRef.current.width) {
      return;
    }
    // Update for future comparison
    tabsRectRef.current = tabsRect;

    // Get array of child nodes from NodeList form
    const childNodesArray = Array.prototype.slice.call(navElementRef.current.children);
    // Use reduce to sum the widths of child nodes and determine the new cutoff index
    const { lastFittingChildIndex } = childNodesArray.reduce((acc, childNode) => {
      const isOverflowElement = childNode === overflowEl.current;
      if (isOverflowElement) {
        return acc;
      }

      acc.sumWidth += childNode.getBoundingClientRect().width;

      if (acc.sumWidth <= tabsRect.width) {
        acc.lastFittingChildIndex += 1;
      }

      return acc;
    }, {
      // Include the overflow element's width to begin with. Doing this means
      // sometimes we'll show a dropdown with one item in it when it would fit,
      // but allowing this case dramatically simplifies the calculations we need
      // to do above.
      sumWidth: overflowEl.current.getBoundingClientRect().width,
      lastFittingChildIndex: 0,
    });

    setCutOffIndex(lastFittingChildIndex);
  }, [windowSize]);

  const tabChildren = useMemo(() => {
    const childrenArray = React.Children.toArray(children);

    // All tabs will be rendered. Those that would overflow are set to invisible.
    const wrappedChildren = childrenArray.map((child, index) => (
      <li className={classNames('nav-item', { invisible: cutOffIndex <= index })}>
        {React.cloneElement(child)}
      </li>
    ));

    // Build the list of items to put in the overflow menu
    const overflowChildren = childrenArray.slice(cutOffIndex)
      .map((overflowChild) => React.cloneElement(overflowChild, { className: 'dropdown-item' }));

    // Insert the overflow menu at the cut off index
    wrappedChildren.splice(cutOffIndex, 0, (
      <li
        className={classNames('nav-items', {
          invisible: cutOffIndex >= React.Children.count(children),
        })}
        ref={overflowEl}
      >
        <Dropdown>
          <Dropdown.Button className="nav-link font-weight-normal">
            <FormattedMessage
              id="learn.course.tabs.navigation.overflow.menu"
              description="The title of the overflow menu for course tabs"
              defaultMessage="More..."
            />
          </Dropdown.Button>
          <Dropdown.Menu className="dropdown-menu-right">{overflowChildren}</Dropdown.Menu>
        </Dropdown>
      </li>
    ));
    return wrappedChildren;
  }, [children, cutOffIndex]);

  return (
    <ul
      {...attrs}
      className={classNames('nav flex-nowrap', className)}
      ref={navElementRef}
    >
      {tabChildren}
    </ul>
  );
}

Tabs.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Tabs.defaultProps = {
  children: null,
  className: undefined,
};
