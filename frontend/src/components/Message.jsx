// frontend/src/components/Message.jsx
import React from 'react';

const Message = ({ message }) => {
  console.log('Rendering message:', message); // Debug log

  return (
    <div className="message">
      <div className="sender">{message.sender?.email || 'Unknown User'}</div>
      <div className="content">{message.content || '[No Content]'}</div>
      <div className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</div>
    </div>
  );
};

export default Message;