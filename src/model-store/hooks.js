import { useSelector, shallowEqual } from 'react-redux';

export function useModel(type, id) {
  return useSelector(
    state => (state.models[type] !== undefined ? state.models[type][id] : undefined),
    shallowEqual,
  );
}

export function useModels(type, ids) {
  return useSelector(
    state => ids.map(
      id => (state.models[type] !== undefined ? state.models[type][id] : undefined),
    ),
    shallowEqual,
  );
}
