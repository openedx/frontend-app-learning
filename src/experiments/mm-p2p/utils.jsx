/* eslint-disable no-console */
import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import util from 'util';

export const isMobile = () => {
  const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
  return Boolean(
    userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i),
  );
};

export const getUser = () => useContext(AppContext).authenticatedUser;

const staticReturnOptions = [
  'dict',
  'inspect',
  Symbol.toStringTag,
  util.inspect.custom,
  Symbol.for('nodejs.util.inspect.custom'),
];

const strictGet = (target, name) => {
  if (name === Symbol.toStringTag) {
    return target;
  }
  if (name === 'length') {
    return target.length;
  }
  if (staticReturnOptions.indexOf(name) >= 0) {
    return target;
  }
  if (name === Symbol.iterator) {
    return { ...target };
  }

  if (name in target || name === '_reactFragment') {
    return target[name];
  }

  console.log(name.toString());
  console.error({ target, name });
  const e = Error(`invalid property "${name.toString()}"`);
  console.error(e.stack);
  return undefined;
};

export const StrictDict = (dict) => new Proxy(dict, { get: strictGet });
