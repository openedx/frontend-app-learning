import { mockUseKeyedState } from '@edx/react-unit-test-utils';
import { useEventListener } from '@src/generic/hooks';
import { messageTypes } from '../constants';

import useModalIFrameData, { stateKeys, DEFAULT_HEIGHT } from './useModalIFrameData';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => ({ cb, prereqs })),
}));
jest.mock('@src/generic/hooks', () => ({
  useEventListener: jest.fn(),
}));

const state = mockUseKeyedState(stateKeys);

describe('useModalIFrameData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    state.mock();
  });
  const testHandleModalClose = ({ trigger }) => {
    const postMessage = jest.fn();
    document.querySelector = jest.fn().mockReturnValue({ contentWindow: { postMessage } });
    trigger();
    state.expectSetStateCalledWith(stateKeys.isOpen, false);
    expect(postMessage).toHaveBeenCalledWith({ type: 'plugin.modal-close' }, '*');
  };
  describe('behavior', () => {
    it('initializes isOpen to false', () => {
      useModalIFrameData();
      state.expectInitializedWith(stateKeys.isOpen, false);
    });
    it('initializes options with default height', () => {
      useModalIFrameData();
      state.expectInitializedWith(stateKeys.options, { height: DEFAULT_HEIGHT });
    });
    describe('eventListener', () => {
      const oldOptions = { some: 'old', options: 'yeah' };
      const prepareListener = () => {
        useModalIFrameData();
        expect(useEventListener).toHaveBeenCalled();
        const call = useEventListener.mock.calls[0][1];
        expect(call.prereqs).toEqual([]);
        return call.cb;
      };
      it('consumes modal events and opens sets modal options with open: true', () => {
        state.mockVals({
          [stateKeys.isOpen]: false,
          [stateKeys.options]: oldOptions,
        });
        const receiveMessage = prepareListener();
        const payload = { test: 'values' };
        receiveMessage({ data: { type: messageTypes.modal, payload } });
        expect(state.setState.isOpen).toHaveBeenCalledWith(true);
        expect(state.setState.options).toHaveBeenCalled();
        const [[setOptionsCb]] = state.setState.options.mock.calls;
        expect(setOptionsCb(oldOptions)).toEqual({ ...oldOptions, ...payload });
      });
      it('ignores events with no type', () => {
        state.mockVals({
          [stateKeys.isOpen]: false,
          [stateKeys.options]: oldOptions,
        });
        const receiveMessage = prepareListener();
        const payload = { test: 'values' };
        receiveMessage({ data: { payload } });
        expect(state.setState.isOpen).not.toHaveBeenCalled();
        expect(state.setState.options).not.toHaveBeenCalled();
      });
      it('calls handleModalClose behavior when receiving a "plugin.modal-close" event', () => {
        const receiveMessage = prepareListener();
        testHandleModalClose({
          trigger: () => {
            receiveMessage({ data: { type: 'plugin.modal-close' } });
          },
        });
      });
    });
  });
  describe('output', () => {
    test('returns handleModalClose callback', () => {
      testHandleModalClose({ trigger: useModalIFrameData().handleModalClose });
    });
    it('forwards modalOptions from state values', () => {
      const modalOptions = { test: 'options' };
      state.mockVals({
        [stateKeys.options]: modalOptions,
        [stateKeys.isOpen]: true,
      });
      expect(useModalIFrameData().modalOptions).toEqual({
        ...modalOptions,
        isOpen: true,
      });
    });
  });
});
