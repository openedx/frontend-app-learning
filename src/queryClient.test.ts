import { QueryClient } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';

import { reducer as modelsReducer } from './generic/model-store';
import { createAppQueryCache } from './queryClient';
import { initializeMockApp } from './setupTest';

const { loggingService } = initializeMockApp();

const makeStore = () => configureStore({ reducer: { models: modelsReducer } });

describe('app query cache', () => {
  let store: ReturnType<typeof makeStore>;
  let queryClient: QueryClient;

  beforeEach(() => {
    store = makeStore();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
      queryCache: createAppQueryCache(store),
    });
    loggingService.logError.mockReset();
  });

  it('reports query errors through onError', async () => {
    const error = new Error('boom');
    await queryClient.fetchQuery({
      queryKey: ['failing'],
      queryFn: () => Promise.reject(error),
    }).catch(() => {});

    expect(loggingService.logError).toHaveBeenCalledWith(error, undefined);
  });

  it('bridges successful results into the model store through onSuccess', async () => {
    await queryClient.fetchQuery({
      queryKey: ['ok'],
      queryFn: () => Promise.resolve({ value: 42 }),
      meta: { modelType: 'widget', courseId: 'course-1' },
    });

    const models = store.getState().models as Record<string, Record<string, unknown>>;
    expect(models.widget['course-1']).toEqual({ id: 'course-1', value: 42 });
  });
});
