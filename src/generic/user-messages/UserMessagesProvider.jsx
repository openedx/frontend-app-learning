import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import UserMessagesContext from './UserMessagesContext';
import { getLocalStorage, popLocalStorage, setLocalStorage } from '../../data/localStorage';

export const ALERT_TYPES = {
  ERROR: 'error',
  DANGER: 'danger',
  SUCCESS: 'success',
  INFO: 'info',
  WELCOME: 'welcome',
};

const FLASH_MESSAGES_LOCAL_STORAGE_KEY = 'UserMessagesProvider.flashMessages';

function addFlashMessage(message) {
  let flashMessages = getLocalStorage(FLASH_MESSAGES_LOCAL_STORAGE_KEY);
  if (!flashMessages || !Array.isArray(flashMessages)) {
    flashMessages = [];
  }
  flashMessages.push(message);
  setLocalStorage(FLASH_MESSAGES_LOCAL_STORAGE_KEY, flashMessages);
}

function popFlashMessages() {
  return popLocalStorage(FLASH_MESSAGES_LOCAL_STORAGE_KEY) || [];
}

export default function UserMessagesProvider({ children }) {
  // Note: The callbacks (add, remove, clear) below interact with useState in very subtle ways.
  // When we call setMessages, we always do so with the function-based form of the handler, making
  // use of the "current" state and not relying on lexical scoping to access the state exposed
  // above with useState.  This is very important and allows us to call multiple "add", "remove",
  // or "clear" functions in a  single render.  Without it, each call to one of the callbacks
  // references back to the -original- value of messages instead of the most recent, causing them
  // all to override each other.  Last one in would win.
  const [messages, setMessages] = useState([]);
  const [nextId, setNextId] = useState(1);

  // Because the add, remove, and clear handlers also need to access nextId, we have to do
  // something a bit different.  There's no way to wait for the "currentNextId" in a setMessages
  // handler.  The alternative is to update a ref, which will always point to the current value by
  // its very nature.
  const refId = useRef(nextId);

  /**
   * Flash messages are a special kind of message that appears once on page refresh.
   */
  function addFlash(message) {
    addFlashMessage(message);
  }

  function add(message) {
    const {
      code, dismissible, text, type, topic, payload, ...others
    } = message;
    const id = refId.current;
    setMessages(currentMessages => [...currentMessages, {
      code, dismissible, text, type, topic, payload, ...others, id,
    }]);
    refId.current += 1;
    setNextId(refId.current);

    return id;
  }

  function remove(id) {
    setMessages(currentMessages => currentMessages.filter(message => message.id !== id));
  }

  function clear(topic = null) {
    setMessages(currentMessages => (topic === null ? [] : currentMessages.filter(message => message.topic !== topic)));
  }

  useEffect(() => {
    // We only allow flash messages to persist through one refresh, then we clear them out.
    // If we want persistent messages, then add a 'persist' key to the messages and handle that
    // as a separate local storage item.
    const flashMessages = popFlashMessages();
    flashMessages.forEach(flashMessage => add(flashMessage));
  }, []);

  const value = {
    add,
    addFlash,
    remove,
    clear,
    messages,
  };

  return (
    <UserMessagesContext.Provider value={value}>
      {children}
    </UserMessagesContext.Provider>
  );
}

UserMessagesProvider.propTypes = {
  children: PropTypes.node,
};

UserMessagesProvider.defaultProps = {
  children: null,
};
