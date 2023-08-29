import React from 'react';

import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils/dist';

import { useEventListener } from '../../../../../generic/hooks';

export const stateKeys = StrictDict({
  modalOptions: 'modalOptions',
});

const useModalIFrameBehavior = () => {
  const [modalOptions, setModalOptions] = useKeyedState(stateKeys.modalOptions, ({ open: false }));

  const receiveMessage = React.useCallback(({ data }) => {
    const { type, payload } = data;
    if (type === 'plugin.modal') {
      payload.open = true;
      setModalOptions(payload);
    }
  }, []);
  useEventListener('message', receiveMessage);

  const handleModalClose = () => {
    setModalOptions({ open: false });
  };

  return {
    handleModalClose,
    modalOptions,
  };
};

export default useModalIFrameBehavior;
