export const isValidCssColor = (value: string) => {
  try {
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
      return CSS.supports('color', value);
    }

    /* istanbul ignore next */
    if (typeof document === 'undefined') {
      return false;
    }

    const element = document.createElement('span');
    element.style.color = '';
    element.style.color = value;
    return element.style.color !== '';
  } catch {
    return false;
  }
};
