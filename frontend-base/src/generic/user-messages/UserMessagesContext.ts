import React from 'react';

export interface UserMessage {
  code: string;
  text?: string;
  topic?: string;
  type?: string;
  payload?: unknown;
  dismissible?: boolean;
}

export interface UserMessagesContextValue {
  add: (message: UserMessage) => number;
  addFlash: (message: UserMessage) => void;
  remove: (id: number) => void;
  clear: (topic?: string | null) => void;
  messages: (UserMessage & { id: number })[];
}

const UserMessagesContext = React.createContext<UserMessagesContextValue | null>(null);

export default UserMessagesContext;
