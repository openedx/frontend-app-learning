import { useSelector, shallowEqual } from 'react-redux';

/*
  Return the selected model with the given id, or an empty object if the model does not exist "{}".
 */
export function useModel(type, id) {
  return useSelector(
    state => ((state.models[type] !== undefined && state.models[type][id] !== undefined) ? state.models[type][id] : {}),
    shallowEqual,
  );
}

export function useModels(type, ids) {
  return useSelector(
    state => ids.map(
      id => ((state.models[type] !== undefined && state.models[type][id] !== undefined) ? state.models[type][id] : {}),
    ),
    shallowEqual,
  );
}
