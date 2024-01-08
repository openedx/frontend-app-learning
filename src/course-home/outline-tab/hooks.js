/* eslint-disable import/prefer-default-export */

import { useEffect, useRef, useState } from 'react';

function useScrollTo(shouldScroll) {
  const ref = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (shouldScroll && !scrolled) {
      setScrolled(true);
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shouldScroll, scrolled]);

  return ref;
}

export {
  useScrollTo,
};
