// frontend/src/components/MessageList.jsx
import React from 'react';
import Message from './Message';

const MessageList = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-2">
      {messages.map((message) => (
        <Message key={message._id || message.timestamp} message={message} />
      ))}
    </div>
  );
};

export default MessageList;