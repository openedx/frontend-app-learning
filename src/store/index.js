import configureStoreProd from './configureStore.prod';
import configureStoreDev from './configureStore.dev';

export default function configureStore(state, env) {
  if (env === 'production') {
    return configureStoreProd(state);
  }
  return configureStoreDev(state);
}
