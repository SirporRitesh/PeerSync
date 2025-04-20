// components/Workspace.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
});

const Workspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/workspace', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response:', res.data);
        setWorkspaces(res.data);
      } catch (err) {
        console.error('Error fetching workspaces:', err);
      }
    };
    fetchWorkspaces();

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('message', (message) => {
      if (message.channel === selectedChannel) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('message');
    };
  }, [selectedChannel]);

  const handleWorkspaceSelect = async (workspaceId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/workspace/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response:', res.data);
      setSelectedWorkspace(res.data);
      setChannels(res.data.channels);
    } catch (err) {
      console.error('Error fetching workspace details:', err);
    }
  };

  const handleChannelSelect = async (channelId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/messages/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response:', res.data);
      setSelectedChannel(channelId);
      setMessages(res.data);
      socket.emit('joinChannel', channelId);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/messages',
        {
          channelId: selectedChannel,
          content: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('API Response:', res.data);
      const message = res.data.message;
      socket.emit('sendMessage', {
        channel: selectedChannel,
        content: newMessage,
        sender: message.sender._id,
        createdAt: message.createdAt,
      });
      setNewMessage('');
      handleChannelSelect(selectedChannel); // Refresh messages
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div>
      <header className="header">
        <h1>PeerSync</h1>
      </header>
      <div className="main-content">
        <div className="sidebar">
          <h3>Workspaces</h3>
          {Array.isArray(workspaces) && workspaces.length > 0 ? (
            <ul>
              {workspaces.map((workspace) => (
                <li
                  key={workspace._id}
                  onClick={() => handleWorkspaceSelect(workspace._id)}
                  className={selectedWorkspace?._id === workspace._id ? 'active' : ''}
                >
                  {workspace.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No workspaces available. Create one to get started!</p>
          )}
          {selectedWorkspace && (
            <>
              <h3>Channels</h3>
              <ul className="channel-list">
                {channels.map((channel) => (
                  <li
                    key={channel._id}
                    onClick={() => handleChannelSelect(channel._id)}
                    className={selectedChannel === channel._id ? 'active' : ''}
                  >
                    {channel.name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="workspace-content">
          {selectedChannel ? (
            <>
              <ul className="message-list">
                {messages.map((msg) => (
                  <li key={msg._id}>
                    <strong>{msg.sender.email}:</strong> {msg.content}
                  </li>
                ))}
              </ul>
              <form onSubmit={handleSendMessage} className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <p>Select a channel to view messages</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace;