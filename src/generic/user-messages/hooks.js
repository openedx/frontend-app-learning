/* eslint-disable import/prefer-default-export */
import isEqual from 'lodash.isequal';
import { useContext, useState, useEffect } from 'react';
import UserMessagesContext from './UserMessagesContext';

export function useAlert(isVisible, {
  code, text, topic, type, payload, dismissible,
}) {
  const { add, remove } = useContext(UserMessagesContext);
  const [alertId, setAlertId] = useState(null);
  const [prevPayload, setPrevPayload] = useState(null);

  useEffect(() => {
    if (!isEqual(payload, prevPayload)) {
      setPrevPayload(payload);
      if (isVisible && alertId === null) {
        setAlertId(add({
          code, text, topic, type, payload, dismissible,
        }));
      } else if (!isVisible && alertId !== null) {
        remove(alertId);
        setAlertId(null);
      }
    }
    return () => {
      if (alertId !== null) {
        remove(alertId);
      }
    };
  });
}
