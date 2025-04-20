// frontend/src/components/MessageInput.jsx
import React, { useState } from 'react';
import axios from 'axios';

const MessageInput = ({ channelId, onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      // Send message to backend
      const response = await axios.post(
        'http://localhost:5000/api/messages',
        { channelId, content: message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 201) {
        onSendMessage(message); // Broadcast via Socket.IO
        setMessage(''); // Clear input
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="message-input flex items-center gap-2">
      <form onSubmit={handleSubmit} className="flex-1 flex items-center">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded px-3 py-2 text-sm text-white bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="ml-2 bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 disabled:bg-gray-500"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;