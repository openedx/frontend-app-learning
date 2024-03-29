import React from 'react';

import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils/dist';

import { useEventListener } from '@src/generic/hooks';

export const stateKeys = StrictDict({
  isOpen: 'isOpen',
  options: 'options',
});

export const DEFAULT_HEIGHT = '100%';

const useModalIFrameData = () => {
  const [isOpen, setIsOpen] = useKeyedState(stateKeys.isOpen, false);
  const [options, setOptions] = useKeyedState(stateKeys.options, { height: DEFAULT_HEIGHT });

  const handleModalClose = () => {
    const rootFrame = document.querySelector('iframe');
    setIsOpen(false);
    rootFrame.contentWindow.postMessage({ type: 'plugin.modal-close' }, '*');
  };

  const receiveMessage = React.useCallback((event) => {
    const { type, payload } = event.data;
    if (!type) {
      return;
    }
    if (type === 'plugin.modal') {
      setOptions((current) => ({ ...current, ...payload }));
      setIsOpen(true);
    }
    if (type === 'plugin.modal-close') {
      handleModalClose();
    }
  }, []);
  useEventListener('message', receiveMessage);

  return {
    handleModalClose,
    modalOptions: { isOpen, ...options },
  };
};

export default useModalIFrameData;
