import { useLayoutEffect, useRef, useState } from 'react';

import type { PathwayData } from './data/types';

// Width kept free at the end of the strip for the "+N" popover trigger
const COUNTER_RESERVED_WIDTH = 74;
// A truncated label narrower than this is unreadable, so it goes to the popover instead
const MIN_TRUNCATED_LABEL_WIDTH = 120;

/**
 * Splits the course pathways into the ones that fit in the strip and the ones that go to the
 * "+N" popover. The split is recalculated whenever the strip resizes.
 */
export const useVisiblePathways = (pathways: PathwayData[]) => {
  // Goes on the element whose width is available for the labels and the trigger
  const containerRef = useRef<HTMLDivElement>(null);
  // Goes on a hidden row that renders every label at its natural width
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(pathways.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure || typeof ResizeObserver === 'undefined') {
      setVisibleCount(pathways.length);
      return undefined;
    }

    const calculate = () => {
      const available = container.clientWidth;
      if (measure.offsetWidth <= available) {
        setVisibleCount(pathways.length);
        return;
      }
      // A label is visible if it starts early enough to show at least the minimum width
      const limit = available - COUNTER_RESERVED_WIDTH - MIN_TRUNCATED_LABEL_WIDTH;
      const labels = Array.from(measure.children) as HTMLElement[];
      setVisibleCount(labels.filter((label) => label.offsetLeft <= limit).length);
    };

    calculate();
    const observer = new ResizeObserver(calculate);
    observer.observe(container);
    // The labels change width without resizing the container, e.g. when the web font loads
    observer.observe(measure);
    return () => observer.disconnect();
  }, [pathways]);

  return {
    containerRef,
    measureRef,
    visiblePathways: pathways.slice(0, visibleCount),
    hiddenPathways: pathways.slice(visibleCount),
  };
};
