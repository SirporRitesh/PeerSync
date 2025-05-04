// frontend/src/components/dashboard/ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import MessageList from '../MessageList';
import MessageInput from '../MessageInput';

const socket = io('http://localhost:5000');

const ChatBox = ({ channel, workspaceId }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/channels/${channel._id}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data);
        console.log('Updated messages state:', response.data);
        scrollToBottom();
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    if (channel._id) {
      fetchMessages();
      socket.emit('joinChannel', channel._id);
    }
  }, [channel._id]);

  useEffect(() => {
    socket.on('message', (newMessage) => {
      console.log('Received message via Socket.IO:', newMessage);
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg._id === newMessage._id);
        if (messageExists) return prevMessages;
        return [...prevMessages, newMessage];
      });
      scrollToBottom();
    });

    return () => {
      socket.off('message');
    };
  }, [channel._id]);

  const handleSendMessage = async (message) => {
    console.log('Sending message:', message);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/messages',
        { channelId: channel._id, content: message },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Message sent successfully:', response.data.message);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      <MessageInput channelId={channel._id} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatBox;