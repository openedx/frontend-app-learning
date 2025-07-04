import React from 'react';
import { renderHook } from '@testing-library/react';
import { useEventListener } from '@src/generic/hooks';
import { messageTypes } from '../constants';

import useModalIFrameData, { DEFAULT_HEIGHT } from './useModalIFrameData';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn((cb, prereqs) => ({ cb, prereqs })),
  useState: jest.fn((initialValue) => [initialValue, jest.fn()]),
}));
jest.mock('@src/generic/hooks', () => ({
  useEventListener: jest.fn(),
}));

const setIsOpen = jest.fn();
const setOptions = jest.fn();

const defaultState = {
  isOpen: false,
  options: { height: DEFAULT_HEIGHT },
};

const mockUseStateWithValues = (values) => {
  jest.spyOn(React, 'useState')
    .mockReturnValueOnce([values.isOpen, setIsOpen])
    .mockReturnValueOnce([values.options, setOptions]);
};

describe('useModalIFrameData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const testHandleModalClose = ({ trigger }) => {
    const postMessage = jest.fn();
    document.querySelector = jest.fn().mockReturnValue({ contentWindow: { postMessage } });
    trigger();
    expect(React.useState).toHaveBeenNthCalledWith(1, false);
    expect(postMessage).toHaveBeenCalledWith({ type: 'plugin.modal-close' }, '*');
  };
  describe('behavior', () => {
    it('should initialize with modal closed and default height', () => {
      const { result } = renderHook(() => useModalIFrameData());

      expect(result.current.modalOptions).toEqual({
        isOpen: false,
        height: DEFAULT_HEIGHT,
      });
    });
    describe('eventListener', () => {
      const oldOptions = { some: 'old', options: 'yeah' };
      const prepareListener = () => {
        expect(useEventListener).toHaveBeenCalled();
        const call = useEventListener.mock.calls[0][1];
        expect(call.prereqs).toEqual([]);
        return call.cb;
      };
      it('consumes modal events and opens sets modal options with open: true', () => {
        mockUseStateWithValues({
          isOpen: false,
          options: oldOptions,
        });
        renderHook(() => useModalIFrameData());
        const receiveMessage = prepareListener();
        const payload = { test: 'values' };
        receiveMessage({ data: { type: messageTypes.modal, payload } });
        expect(setIsOpen).toHaveBeenCalledWith(true);
        expect(setOptions).toHaveBeenCalled();
        const [[setOptionsCb]] = setOptions.mock.calls;
        expect(setOptionsCb(oldOptions)).toEqual({ ...oldOptions, ...payload });
      });
      it('ignores events with no type', () => {
        const { result } = renderHook(() => useModalIFrameData());
        const initialState = result.current.modalOptions;
        const receiveMessage = prepareListener();
        const payload = { test: 'values' };
        receiveMessage({ data: { payload } });
        expect(result.current.modalOptions).toEqual(initialState);
      });
      it('calls handleModalClose behavior when receiving a "plugin.modal-close" event', () => {
        renderHook(() => useModalIFrameData());
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
      mockUseStateWithValues(defaultState);
      testHandleModalClose({ trigger: useModalIFrameData().handleModalClose });
    });
    it('forwards modalOptions from state values', () => {
      const modalOptions = { test: 'options' };
      mockUseStateWithValues({
        isOpen: true,
        options: modalOptions,
      });
      expect(useModalIFrameData().modalOptions).toEqual({
        ...modalOptions,
        isOpen: true,
      });
    });
  });
});
