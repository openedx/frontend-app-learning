import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import UserMessagesContext from './UserMessagesContext';
import Alert from './Alert';

export default function AlertList({ topic, className }) {
  const { remove, messages } = useContext(UserMessagesContext);

  return (
    <div className={className}>
      {messages.filter(message => !topic || message.topic === topic).map(message => (
        <Alert
          key={message.id}
          type={message.type}
          dismissible={message.dismissible}
          onDismiss={() => remove(message.id)}
        >
          {message.text}
        </Alert>
      ))}
    </div>
  );
}

AlertList.propTypes = {
  className: PropTypes.string,
  topic: PropTypes.string,
};

AlertList.defaultProps = {
  topic: null,
  className: null,
};
