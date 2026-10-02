import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';

import initializeStore from '@src/store';
import { useModel, useModels } from './hooks';
import { addModel } from './slice';

describe('useModels', () => {
  const renderUseModels = (type: string, ids: string[]) => {
    const store = initializeStore();
    store.dispatch(addModel({ modelType: 'sections', model: { id: 'a', title: 'A' } }));
    store.dispatch(addModel({ modelType: 'sections', model: { id: 'b', title: 'B' } }));
    const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
    return renderHook(() => useModels(type, ids), { wrapper }).result.current;
  };

  it('returns each id\'s model in order, and {} for an id not in the store', () => {
    expect(renderUseModels('sections', ['b', 'missing', 'a'])).toEqual([{ id: 'b', title: 'B' }, {}, { id: 'a', title: 'A' }]);
  });

  it('returns {} for each id of a model type not in the store', () => {
    expect(renderUseModels('sequences', ['a', 'b'])).toEqual([{}, {}]);
  });
});

describe('useModel', () => {
  const renderUseModel = (type: string, id: string) => {
    const store = initializeStore();
    store.dispatch(addModel({ modelType: 'sections', model: { id: 'a', title: 'A' } }));
    const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
    return renderHook(() => useModel(type, id), { wrapper }).result.current;
  };

  it('returns the model for an id in the store', () => {
    expect(renderUseModel('sections', 'a')).toEqual({ id: 'a', title: 'A' });
  });

  it('returns {} for an id not in the store, and for a model type not in the store', () => {
    expect(renderUseModel('sections', 'missing')).toEqual({});
    expect(renderUseModel('sequences', 'a')).toEqual({});
  });
});
