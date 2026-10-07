import { useLayoutEffect, useRef, useState } from 'react';

import type { PathwayData } from './data/types';

// Width kept free at the end of the strip for the "+N" popover trigger
const COUNTER_RESERVED_WIDTH = 74;

/**
 * Splits the course pathways into the ones that fit in the strip and the ones that go to the
 * "+N" popover. Only the labels that fit entirely are shown, so a label that would be cut goes to
 * the popover, even if it is the first one. The split is recalculated whenever the strip resizes.
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
      // A label is visible if it ends before the space kept for the "+N" trigger
      const limit = available - COUNTER_RESERVED_WIDTH;
      const labels = Array.from(measure.children) as HTMLElement[];
      // In RTL the labels start at the right edge, so their start is measured from there
      const isRtl = getComputedStyle(measure).direction === 'rtl';
      const endOf = (label: HTMLElement) => (
        isRtl ? measure.offsetWidth - label.offsetLeft : label.offsetLeft + label.offsetWidth
      );
      setVisibleCount(labels.filter((label) => endOf(label) <= limit).length);
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
