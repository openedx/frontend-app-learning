import { mockUseKeyedState } from '@edx/react-unit-test-utils';
import { useEventListener } from '../../../../../generic/hooks';
import { messageTypes } from '../constants';

import useModalIFrameBehavior, { stateKeys, DEFAULT_HEIGHT } from './useModalIFrameData';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => ({ cb, prereqs })),
}));
jest.mock('../../../../../generic/hooks', () => ({
  useEventListener: jest.fn(),
}));

const state = mockUseKeyedState(stateKeys);

describe('useModalIFrameBehavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
  });
  describe('behavior', () => {
    it('initializes isOpen to false', () => {
      useModalIFrameBehavior();
      state.expectInitializedWith(stateKeys.isOpen, false);
    });
    it('initializes options with default height', () => {
      useModalIFrameBehavior();
      state.expectInitializedWith(stateKeys.options, { height: DEFAULT_HEIGHT });
    });
    describe('eventListener', () => {
      it('consumes modal events and opens sets modal options with open: true', () => {
        const oldOptions = { some: 'old', options: 'yeah' };
        state.mockVals({
          [stateKeys.isOpen]: false,
          [stateKeys.options]: oldOptions,
        });
        useModalIFrameBehavior();
        expect(useEventListener).toHaveBeenCalled();
        const { cb, prereqs } = useEventListener.mock.calls[0][1];
        expect(prereqs).toEqual([]);
        const payload = { test: 'values' };
        cb({ data: { type: messageTypes.modal, payload } });
        expect(state.setState.isOpen).toHaveBeenCalledWith(true);
        expect(state.setState.options).toHaveBeenCalled();
        const [[setOptionsCb]] = state.setState.options.mock.calls;
        expect(setOptionsCb(oldOptions)).toEqual({ ...oldOptions, ...payload });
      });
    });
  });
  describe('output', () => {
    test('handleModalClose sets modal options to closed', () => {
      useModalIFrameBehavior().handleModalClose();
      state.expectSetStateCalledWith(stateKeys.isOpen, false);
    });
    it('forwards modalOptions from state values', () => {
      const modalOptions = { test: 'options' };
      state.mockVals({
        [stateKeys.options]: modalOptions,
        [stateKeys.isOpen]: true,
      });
      expect(useModalIFrameBehavior().modalOptions).toEqual({
        ...modalOptions,
        isOpen: true,
      });
    });
  });
});
