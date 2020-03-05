import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import UserMessagesContext from './UserMessagesContext';

export default function UserMessagesProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [nextId, setNextId] = useState(1);

  const refMessages = useRef(messages);

  const add = ({
    code, dismissible, text, type, topic, ...others
  }) => {
    const id = nextId;
    refMessages.current = [...refMessages.current, {
      code, dismissible, text, type, topic, ...others, id,
    }];
    setMessages(refMessages.current);
    setNextId(nextId + 1);
    return id;
  };

  const remove = id => {
    refMessages.current = refMessages.current.filter(message => message.id !== id);
    setMessages(refMessages.current);
  };

  const clear = (topic = null) => {
    refMessages.current = topic === null ? [] : refMessages.current.filter(message => message.topic !== topic);

    setMessages(refMessages.current);
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
