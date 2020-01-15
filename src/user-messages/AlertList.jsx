import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import UserMessagesContext from './UserMessagesContext';
import Alert from './Alert';

export default function AlertList({ topic, className }) {
  const { remove, messages } = useContext(UserMessagesContext);

  const topicMessages = messages.filter(message => !topic || message.topic === topic);
  if (topicMessages.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {topicMessages.map(message => (
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
