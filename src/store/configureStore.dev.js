import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunkMiddleware from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import { createLogger } from 'redux-logger';

import createRootReducer from '../reducers';
import rootSaga from '../sagas';

export default function configureStore(initialState = {}) {
  const history = createBrowserHistory();

  const loggerMiddleware = createLogger({
    collapsed: true,
  });
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    createRootReducer(history),
    initialState,
    composeWithDevTools(applyMiddleware(thunkMiddleware, sagaMiddleware, routerMiddleware(history), loggerMiddleware)), // eslint-disable-line
  );

  sagaMiddleware.run(rootSaga);

  return { store, history };
}
