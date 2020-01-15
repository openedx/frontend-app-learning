import React, { useState } from 'react';
import PropTypes from 'prop-types';

import UserMessagesContext from './UserMessagesContext';

export default function UserMessagesProvider({ children }) {
  const [messages, setMessages] = useState([
    {
      code: null,
      dismissible: true,
      id: 0,
      text: 'This is a course level message.',
      type: 'info',
      topic: 'course',
    },
  ]);
  const [nextId, setNextId] = useState(1);

  const add = (message) => {
    setMessages([...messages, { ...message, id: nextId }]);
    setNextId(nextId + 1);
  };
  const remove = id => setMessages(messages.filter(message => message.id !== id));

  const value = {
    add,
    remove,
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
