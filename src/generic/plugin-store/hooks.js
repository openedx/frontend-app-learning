import { useSelector, shallowEqual } from 'react-redux';

// eslint-disable-next-line import/prefer-default-export
export function usePluginsCallback(methodName, defaultMethod) {
  return useSelector(
    state => (() => {
      let result = defaultMethod();
      Object.values(state.plugins).forEach((plugin) => {
        if (plugin[methodName]) {
          result = plugin[methodName](result);
        }
      });
      return result;
    }),
    shallowEqual,
  );
}
