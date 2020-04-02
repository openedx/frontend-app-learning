import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import UserMessagesContext from './UserMessagesContext';

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

  const add = ({
    code, dismissible, text, type, topic, ...others
  }) => {
    const id = refId.current;
    setMessages(currentMessages => [...currentMessages, {
      code, dismissible, text, type, topic, ...others, id,
    }]);
    refId.current += 1;
    setNextId(refId.current);
    return refId.current;
  };

  const remove = id => {
    setMessages(currentMessages => currentMessages.filter(message => message.id !== id));
  };

  const clear = (topic = null) => {
    setMessages(currentMessages => (topic === null ? [] : currentMessages.filter(message => message.topic !== topic)));
  };

  const value = {
    add,
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
