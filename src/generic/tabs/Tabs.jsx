import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import useIndexOfLastVisibleChild from './useIndexOfLastVisibleChild';

export default function Tabs({ children, className, ...attrs }) {
  const [
    indexOfLastVisibleChild,
    containerElementRef,
    invisibleStyle,
    overflowElementRef,
  ] = useIndexOfLastVisibleChild();

  const tabChildren = useMemo(() => {
    const childrenArray = React.Children.toArray(children);
    const indexOfOverflowStart = indexOfLastVisibleChild + 1;

    // All tabs will be rendered. Those that would overflow are set to invisible.
    const wrappedChildren = childrenArray.map((child, index) => React.cloneElement(child, {
      style: index > indexOfLastVisibleChild ? invisibleStyle : null,
    }));

    // Build the list of items to put in the overflow menu
    const overflowChildren = childrenArray.slice(indexOfOverflowStart)
      .map(overflowChild => React.cloneElement(overflowChild, { className: 'dropdown-item' }));

    // Insert the overflow menu at the cut off index (even if it will be hidden
    // it so it can be part of measurements)
    wrappedChildren.splice(indexOfOverflowStart, 0, (
      <div
        className="nav-item flex-shrink-0"
        style={indexOfOverflowStart >= React.Children.count(children) ? invisibleStyle : null}
        ref={overflowElementRef}
        key="overflow"
      >
        <Dropdown className="h-100">
          <Dropdown.Toggle variant="link" className="nav-link h-100" id="learn.course.tabs.navigation.overflow.menu">
            <FormattedMessage
              id="learn.course.tabs.navigation.overflow.menu"
              description="The title of the overflow menu for course tabs"
              defaultMessage="More..."
            />
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-right">{overflowChildren}</Dropdown.Menu>
        </Dropdown>
      </div>
    ));
    return wrappedChildren;
  }, [children, indexOfLastVisibleChild]);

  return (
    <nav
      {...attrs}
      className={classNames('nav flex-nowrap', className)}
      ref={containerElementRef}
    >
      {tabChildren}
    </nav>
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
