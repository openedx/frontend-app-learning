import type { Query } from '@tanstack/react-query';
import { Store } from 'redux';

import { addModel } from '@src/generic/model-store';

interface ModelStoreMeta {
  modelType?: string;
  courseId?: string;
}

// Transitional (#1977): bridge a React Query result into the model store so existing
// `useModel(...)` readers (the shared TabPage/LoadedTabPage and not-yet-converted tabs)
// keep working until the model store is dissolved. A query opts in by tagging itself with
// `meta: { modelType, courseId }`. This is wired as the app QueryCache's `onSuccess` (see
// src/queryClient.ts), so it runs before observers re-render.
export const bridgeToModelStore = (store: Store, data: unknown, query: Query<unknown, unknown>) => {
  const { modelType, courseId } = (query.meta ?? {}) as ModelStoreMeta;
  if (modelType) {
    store.dispatch(addModel({ modelType, model: { id: courseId, ...(data as Record<string, unknown>) } }));
  }
};
