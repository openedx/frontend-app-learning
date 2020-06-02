import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import UserMessagesContext from './UserMessagesContext';

export const ALERT_TYPES = {
  ERROR: 'error',
  DANGER: 'danger',
  SUCCESS: 'success',
  INFO: 'info',
};

// NOTE: This storage key is not namespaced.  That means that it's shared for the current fully
// qualified domain.  Namespacing could be added by adding an optional prop to UserMessagesProvider
// to set a namespace, but we'll cross that bridge when we need it.
const FLASH_MESSAGES_LOCAL_STORAGE_KEY = 'UserMessagesProvider.flashMessages';

function getFlashMessages() {
  let flashMessages = [];
  try {
    if (global.localStorage) {
      const rawItem = global.localStorage.getItem(FLASH_MESSAGES_LOCAL_STORAGE_KEY);
      if (rawItem) {
        // Only try to parse and set flashMessages from the raw item if it exists.
        const parsed = JSON.parse(rawItem);
        if (Array.isArray(parsed)) {
          flashMessages = parsed;
        }
      }
    }
  } catch (e) {
    // If this fails for some reason, just return the empty array.
  }
  return flashMessages;
}

function addFlashMessage(message) {
  try {
    if (global.localStorage) {
      const flashMessages = getFlashMessages();
      flashMessages.push(message);
      global.localStorage.setItem(FLASH_MESSAGES_LOCAL_STORAGE_KEY, JSON.stringify(flashMessages));
    }
  } catch (e) {
    // If this fails, just bail.
  }
}

function clearFlashMessages() {
  try {
    if (global.localStorage) {
      global.localStorage.removeItem(FLASH_MESSAGES_LOCAL_STORAGE_KEY);
    }
  } catch (e) {
    // If this fails, just bail.
  }
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
    const flashMessages = getFlashMessages();
    flashMessages.forEach(flashMessage => add(flashMessage));
    // We only allow flash messages to persist through one refresh, then we clear them out.
    // If we want persistent messages, then add a 'persist' key to the messages and handle that
    // as a separate local storage item.
    clearFlashMessages();
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
