// frontend/src/components/dashboard/ChatBox.jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import MessageList from '../MessageList';
import MessageInput from '../MessageInput';

const socket = io('http://localhost:5000');

const ChatBox = ({ channel, workspaceId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Join the channel room
    socket.emit('joinChannel', channel._id);

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages/${channel._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMessages(data);
        } else {
          console.error('Error fetching messages:', data.message);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    // Listen for new messages
    socket.on('message', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Cleanup on unmount
    return () => {
      socket.off('message');
    };
  }, [channel._id]);

  const handleSendMessage = (content) => {
    const message = {
      channel: channel._id,
      content,
      sender: localStorage.getItem('userId'), // Assume userId is stored after login
      timestamp: new Date().toISOString(),
    };
    socket.emit('sendMessage', message); // Broadcast the message
  };

  return (
    <div className="flex flex-col flex-1 p-4 bg-gray-800">
      {/* Channel Name */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">#{channel.name}</h2>
      </div>

      {/* Message List */}
      <MessageList messages={messages} />

      {/* Message Input */}
      <MessageInput channelId={channel._id} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatBox;