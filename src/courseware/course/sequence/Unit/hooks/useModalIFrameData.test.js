import { mockUseKeyedState } from '@edx/react-unit-test-utils';
import { useEventListener } from '../../../../../generic/hooks';
import { messageTypes } from '../constants';

import useModalIFrameBehavior, { stateKeys } from './useModalIFrameData';

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
    it('initializes modalOptions to closed', () => {
      useModalIFrameBehavior();
      state.expectInitializedWith(stateKeys.modalOptions, { open: false });
    });
    describe('eventListener', () => {
      it('consumes modal events and opens sets modal options with open: true', () => {
        useModalIFrameBehavior();
        expect(useEventListener).toHaveBeenCalled();
        const { cb, prereqs } = useEventListener.mock.calls[0][1];
        expect(prereqs).toEqual([]);
        const payload = { test: 'values' };
        cb({ data: { type: messageTypes.modal, payload } });
        expect(state.setState.modalOptions).toHaveBeenCalledWith({ ...payload, open: true });
      });
    });
  });
  describe('output', () => {
    test('handleModalClose sets modal options to closed', () => {
      useModalIFrameBehavior().handleModalClose();
      state.expectSetStateCalledWith(stateKeys.modalOptions, { open: false });
    });
    it('forwards modalOptions from state value', () => {
      const modalOptions = { test: 'options' };
      state.mockVal(stateKeys.modalOptions, modalOptions);
      expect(useModalIFrameBehavior().modalOptions).toEqual(modalOptions);
    });
  });
});
