import { useState, useEffect } from 'react';

// NOTE: These are the breakpoints used in Bootstrap v4.0.0 as seen in
// the documentation (https://getbootstrap.com/docs/4.0/layout/overview/#responsive-breakpoints)
export const responsiveBreakpoints = {
  extraSmall: {
    maxWidth: 575.98,
  },
  small: {
    minWidth: 576,
    maxWidth: 767.98,
  },
  medium: {
    minWidth: 768,
    maxWidth: 991.98,
  },
  large: {
    minWidth: 992,
    maxWidth: 1199.98,
  },
  extraLarge: {
    minWidth: 1200,
  },
};

export default function useWindowSize() {
  const isClient = typeof global === 'object';

  const getSize = () => ({
    width: isClient ? global.innerWidth : undefined,
    height: isClient ? global.innerHeight : undefined,
  });

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    const handleResize = () => {
      setWindowSize(getSize());
    };
    global.addEventListener('resize', handleResize);
    return () => global.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
