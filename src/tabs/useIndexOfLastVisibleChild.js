import { useLayoutEffect, useRef, useState } from 'react';
import useWindowSize from './useWindowSize';

const invisibleStyle = {
  position: 'absolute',
  left: 0,
  pointerEvents: 'none',
  visibility: 'hidden',
};

export default function useIndexOfLastVisibleChild() {
  const containerElementRef = useRef(null);
  const overflowElementRef = useRef(null);
  const containingRectRef = useRef({});
  const [indexOfLastVisibleChild, setIndexOfLastVisibleChild] = useState(-1);
  const windowSize = useWindowSize();

  useLayoutEffect(() => {
    const containingRect = containerElementRef.current.getBoundingClientRect();

    // No-op if the width is unchanged.
    // (Assumes tabs themselves don't change count or width).
    if (!containingRect.width === containingRectRef.current.width) {
      return;
    }
    // Update for future comparison
    containingRectRef.current = containingRect;

    // Get array of child nodes from NodeList form
    const childNodesArr = Array.prototype.slice.call(containerElementRef.current.children);
    const { nextIndexOfLastVisibleChild } = childNodesArr
      // filter out the overflow element
      .filter(childNode => childNode !== overflowElementRef.current)
      // sum the widths to find the last visible element's index
      .reduce((acc, childNode, index) => {
        // use floor to prevent rounding errors
        acc.sumWidth += Math.floor(childNode.getBoundingClientRect().width);
        if (acc.sumWidth <= containingRect.width) {
          acc.nextIndexOfLastVisibleChild = index;
        }
        return acc;
      }, {
        // Include the overflow element's width to begin with. Doing this means
        // sometimes we'll show a dropdown with one item in it when it would fit,
        // but allowing this case dramatically simplifies the calculations we need
        // to do above.
        sumWidth: overflowElementRef.current ? overflowElementRef.current.getBoundingClientRect().width : 0,
        nextIndexOfLastVisibleChild: -1,
      });


    setIndexOfLastVisibleChild(nextIndexOfLastVisibleChild);
  }, [windowSize, containerElementRef.current]);

  return [indexOfLastVisibleChild, containerElementRef, invisibleStyle, overflowElementRef];
}
