import React from 'react';

import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils/dist';

import { useEventListener } from '../../../../../generic/hooks';

export const stateKeys = StrictDict({
  isOpen: 'isOpen',
  options: 'options',
});

export const DEFAULT_HEIGHT = '100vh';

const useModalIFrameBehavior = () => {
  const [isOpen, setIsOpen] = useKeyedState(stateKeys.isOpen, false);
  const [options, setOptions] = useKeyedState(stateKeys.options, { height: DEFAULT_HEIGHT });

  const receiveMessage = React.useCallback(({ data }) => {
    const { type, payload } = data;
    if (type === 'plugin.modal') {
      setOptions((current) => ({ ...current, ...payload }));
      setIsOpen(true);
    }
  }, []);
  useEventListener('message', receiveMessage);

  const handleModalClose = () => {
    setIsOpen(false);
  };

  return {
    handleModalClose,
    modalOptions: { isOpen, ...options },
  };
};

export default useModalIFrameBehavior;
