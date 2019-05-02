import { applyMiddleware, createStore, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunkMiddleware from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';

import createRootReducer from '../reducers';
import rootSaga from '../sagas';

export default function configureStore(initialState = {}) {
  const history = createBrowserHistory();

  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    createRootReducer(history),
    initialState,
    compose(applyMiddleware(thunkMiddleware, sagaMiddleware, routerMiddleware(history))),
  );

  sagaMiddleware.run(rootSaga);

  return { store, history };
}
