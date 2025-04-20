// frontend/src/components/Message.jsx
import React from 'react';

const Message = ({ message }) => {
  return (
    <div className="message">
      <div className="sender">{message.sender.email}</div>
      <div className="content">{message.content}</div>
      <div className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</div>
    </div>
  );
};

export default Message;