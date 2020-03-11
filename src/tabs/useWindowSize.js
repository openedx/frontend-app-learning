import { useState, useEffect } from 'react';

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
