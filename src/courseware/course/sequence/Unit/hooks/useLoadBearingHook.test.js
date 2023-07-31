import React from 'react';
import useLoadBearingHook from './useLoadBearingHook';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useLayoutEffect: jest.fn(),
}));

const setState = jest.fn();
React.useState.mockImplementation((val) => [val, setState]);

const id = 'test-id';
describe('useLoadBearingHook', () => {
  it('increments a simple value w/ useLayoutEffect', () => {
    useLoadBearingHook(id);
    expect(React.useState).toHaveBeenCalledWith(0);
    const [[layoutCb, prereqs]] = React.useLayoutEffect.mock.calls;
    expect(prereqs).toEqual([id]);
    layoutCb();
    const [[setValueCb]] = setState.mock.calls;
    expect(setValueCb(1)).toEqual(2);
  });
});
