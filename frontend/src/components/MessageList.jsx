// frontend/src/components/MessageList.jsx
import React from 'react';
import Message from './Message';

const MessageList = ({ messages }) => {
  console.log('Rendering MessageList with messages:', messages);

  if (!messages || messages.length === 0) {
    return <div className="p-4 text-gray-500">No messages yet</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-4">
      {messages.map((message) => (
        <Message key={message._id} message={message} />
      ))}
    </div>
  );
};

export default MessageList;