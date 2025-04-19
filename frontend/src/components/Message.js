// src/components/Message.js
import React from "react";

const Message = ({ message }) => {
  return (
    <div className="message">
      <div className="message-header">
        <strong>{message.sender.name}</strong>
        <span>{new Date(message.timestamp).toLocaleString()}</span>
      </div>
      <div className="message-content">
        <p>{message.content}</p>
      </div>
    </div>
  );
};

export default Message;
