import { QueryCache, QueryClient } from '@tanstack/react-query';

import { addModelsMap } from '@src/generic/model-store';
import initializeStore from '@src/store';
import { bridgeToModelStore } from './modelStoreBridge';

type Store = ReturnType<typeof initializeStore>;

const modelsOf = (store: Store) => store.getState().models as Record<string, Record<string, unknown>>;

const runQuery = (queryClient: QueryClient, queryFn: () => unknown, meta: Record<string, unknown>) => (
  queryClient.fetchQuery({ queryKey: [Math.random().toString()], queryFn, meta })
);

describe('modelStoreBridge', () => {
  let store: Store;
  let queryClient: QueryClient;

  beforeEach(() => {
    store = initializeStore();
    queryClient = new QueryClient({
      queryCache: new QueryCache({ onSuccess: (data, query) => bridgeToModelStore(store, data, query) }),
    });
  });

  it('single form: mirrors the whole result as one model keyed by courseId', async () => {
    await runQuery(queryClient, () => ({ foo: 'bar' }), { modelType: 'dates', courseId: 'course-1' });

    expect(modelsOf(store).dates['course-1']).toEqual({ id: 'course-1', foo: 'bar' });
  });

  it('list form addModel: mirrors the whole result as one model (using its own id)', async () => {
    await runQuery(
      queryClient,
      () => ({ id: 'course-1', title: 'Demo' }),
      { models: [{ modelType: 'coursewareMeta', strategy: 'addModel' }] },
    );

    expect(modelsOf(store).coursewareMeta['course-1']).toEqual({ id: 'course-1', title: 'Demo' });
  });

  it('list form: fans one result out to several collection mirrors via source keys', async () => {
    await runQuery(
      queryClient,
      () => ({
        courses: { c1: { id: 'c1', sectionIds: ['s1'] } },
        sections: { s1: { id: 's1', title: 'Section' } },
        sequences: { q1: { id: 'q1', title: 'Sequence' } },
      }),
      {
        models: [
          { modelType: 'coursewareMeta', strategy: 'updateModelsMap', source: 'courses' },
          { modelType: 'sections', strategy: 'addModelsMap', source: 'sections' },
          { modelType: 'sequences', strategy: 'updateModelsMap', source: 'sequences' },
        ],
      },
    );

    const models = modelsOf(store);
    expect(models.coursewareMeta.c1).toEqual({ id: 'c1', sectionIds: ['s1'] });
    expect(models.sections.s1).toEqual({ id: 's1', title: 'Section' });
    expect(models.sequences.q1).toEqual({ id: 'q1', title: 'Sequence' });
  });

  it('updateModelsMap merges into an existing model rather than replacing it', async () => {
    store.dispatch(addModelsMap({
      modelType: 'sequences',
      modelsMap: { q1: { id: 'q1', unitIds: ['u1', 'u2'], activeUnitIndex: 0 } },
    }));

    await runQuery(
      queryClient,
      () => ({ sequences: { q1: { id: 'q1', title: 'Sequence' } } }),
      { models: [{ modelType: 'sequences', strategy: 'updateModelsMap', source: 'sequences' }] },
    );

    expect(modelsOf(store).sequences.q1).toEqual({
      id: 'q1',
      title: 'Sequence',
      unitIds: ['u1', 'u2'],
      activeUnitIndex: 0,
    });
  });

  it('updateModels merges an array of models', async () => {
    await runQuery(
      queryClient,
      () => ({ units: [{ id: 'u1', complete: true }, { id: 'u2', complete: false }] }),
      { models: [{ modelType: 'units', strategy: 'updateModels', source: 'units' }] },
    );

    const { units } = modelsOf(store);
    expect(units.u1).toEqual({ id: 'u1', complete: true });
    expect(units.u2).toEqual({ id: 'u2', complete: false });
  });

  it('updateModel merges a single model by id (via source)', async () => {
    store.dispatch(addModelsMap({
      modelType: 'coursewareMeta',
      modelsMap: { 'course-1': { id: 'course-1', title: 'Old', tabs: ['outline'] } },
    }));

    await runQuery(
      queryClient,
      () => ({ course: { id: 'course-1', title: 'New' } }),
      { models: [{ modelType: 'coursewareMeta', strategy: 'updateModel', source: 'course' }] },
    );

    expect(modelsOf(store).coursewareMeta['course-1']).toEqual({ id: 'course-1', title: 'New', tabs: ['outline'] });
  });

  it('ignores an unrecognized strategy', async () => {
    await runQuery(
      queryClient,
      () => ({ id: 'course-1' }),
      { models: [{ modelType: 'coursewareMeta', strategy: 'nope' }] },
    );

    expect(store.getState().models).toEqual({});
  });

  it('does nothing when a query has no model-store meta', async () => {
    await runQuery(queryClient, () => ({ foo: 'bar' }), {});

    expect(store.getState().models).toEqual({});
  });
});
