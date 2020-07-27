/* eslint-disable import/prefer-default-export */
import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { ALERT_TYPES, useAlert } from '../../generic/user-messages';

export function useLogistrationAlert() {
  const { authenticatedUser } = useContext(AppContext);
  const isVisible = authenticatedUser === null;

  useAlert(isVisible, {
    code: 'clientLogistrationAlert',
    topic: 'outline',
    dismissible: false,
    type: ALERT_TYPES.ERROR,
  });
}
