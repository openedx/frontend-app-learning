import type { Query } from '@tanstack/react-query';
import { Store } from 'redux';

import {
  addModel,
  addModelsMap,
  updateModel,
  updateModels,
  updateModelsMap,
} from '@src/generic/model-store';

type MirrorStrategy =
  | 'addModel'
  | 'updateModel'
  | 'addModelsMap'
  | 'updateModelsMap'
  | 'updateModels';

interface ModelMirror {
  modelType: string;
  strategy: MirrorStrategy;
  source?: string;
}

export type ModelStoreMeta = {
  modelType?: string;
  courseId?: string;
  models?: ModelMirror[];
};

// Transitional (#1977): bridge a React Query result into the model store so existing
// `useModel(...)` readers (the shared TabPage/LoadedTabPage and not-yet-converted tabs)
// keep working until the model store is dissolved. A query opts in via `meta`, either:
//   `{ modelType, courseId }`            — the whole result as one model keyed by courseId
//   `{ models: [{ modelType, strategy, source? }] }` — one or more mirrors, each running a
//     model-store action (`source` selects a key of the result; omitted = the whole result)
// This is wired as the app QueryCache's `onSuccess` (see src/queryClient.ts), so it runs
// before observers re-render.
export const bridgeToModelStore = (store: Store, data: unknown, query: Query<unknown, unknown>) => {
  const { modelType, courseId, models } = query.meta ?? {};

  if (modelType) {
    store.dispatch(addModel({ modelType, model: { id: courseId, ...(data as Record<string, unknown>) } }));
  }

  models?.forEach(({ modelType: type, strategy, source }) => {
    const payload = source ? (data as Record<string, unknown>)[source] : data;
    switch (strategy) {
      case 'addModel': store.dispatch(addModel({ modelType: type, model: payload })); break;
      case 'updateModel': store.dispatch(updateModel({ modelType: type, model: payload })); break;
      case 'addModelsMap': store.dispatch(addModelsMap({ modelType: type, modelsMap: payload })); break;
      case 'updateModelsMap': store.dispatch(updateModelsMap({ modelType: type, modelsMap: payload })); break;
      case 'updateModels': store.dispatch(updateModels({ modelType: type, models: payload })); break;
      default: break;
    }
  });
};
