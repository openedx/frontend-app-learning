import { logError } from '@edx/frontend-platform/logging';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { Store } from 'redux';

import { bridgeToModelStore } from './data/modelStoreBridge';

// `onSuccess` bridges results into the model store (transitional, #1977); the `store` param
// exists only to feed it and goes away when the bridge is removed.
export const createAppQueryCache = (store: Store) => new QueryCache({
  onSuccess: (data, query) => bridgeToModelStore(store, data, query),
  onError: (error) => logError(error),
});

export const createQueryClient = (store: Store) => new QueryClient({
  queryCache: createAppQueryCache(store),
});
