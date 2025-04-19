import React, { useState } from 'react';

const ChatBox = ({ messages = [], onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className="bg-gray-100 p-2 rounded">
            <div className="text-sm font-medium text-gray-700">{msg.sender}</div>
            <div className="text-sm text-gray-800">{msg.text}</div>
            <div className="text-xs text-gray-500">{msg.time}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
