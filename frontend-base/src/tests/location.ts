const originalLocation = window.location;

// jsdom cannot navigate, and its Location members are non-configurable, so tests swap the whole object.
export const mockLocation = <T extends Partial<Location>>(members: T) => {
  const location: Location & T = { ...originalLocation, ...members };
  Object.defineProperty(window, 'location', { configurable: true, value: location });
  return location;
};

export const restoreLocation = () => {
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
};
