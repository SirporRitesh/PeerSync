// components/Workspace.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const socket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket'],
});

const Workspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(''); // Add error state
  const navigate = useNavigate(); // Add navigate hook

  // Fetch workspaces once on component mount
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        if (!token) {
          throw new Error('No token found');
        }
        const res = await axios.get('http://localhost:5000/api/workspace', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkspaces(res.data);

        // Auto-select the first workspace
        if (res.data.length > 0) {
          const firstWorkspace = res.data[0];
          handleWorkspaceSelect(firstWorkspace._id); // Load channels too
        }
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setError('Failed to load workspaces. Please try logging in again.');
        if (err.response?.status === 401 || err.message === 'No token found') {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        }
      }
    };
    fetchWorkspaces();
  }, [navigate]);

  // Set up Socket.IO listeners
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server:', socket.id);
    });

    socket.on('message', (message) => {
      console.log('Received message via Socket.IO:', message);
      if (message.channel === selectedChannel) {
        setMessages((prevMessages) => {
          const messageExists = prevMessages.some((msg) => msg.createdAt === message.createdAt && msg.content === message.content);
          if (messageExists) return prevMessages;
          return [...prevMessages, message];
        });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
    });

    return () => {
      socket.off('connect');
      socket.off('message');
      socket.off('connect_error');
    };
  }, []);

  useEffect(() => {
    socket.on('message', (message) => {
      console.log('Received message via Socket.IO:', message);
      if (message.channel === selectedChannel) {
        setMessages((prevMessages) => {
          // Check if the message already exists
          const messageExists = prevMessages.some(
            (msg) => msg._id === message._id || (msg.content === message.content && msg.createdAt === message.createdAt)
          );
          if (messageExists) return prevMessages;
          return [...prevMessages, message];
        });
      }
    });

    return () => {
      socket.off('message');
    };
  }, [selectedChannel]);

  const handleWorkspaceSelect = useCallback(async (workspaceId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/workspace/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Workspace details:', res.data); // Debug log
      setSelectedWorkspace(res.data);
      setChannels(res.data.channels || []); // Ensure channels is an array

      // Auto-select the first channel
      if (res.data.channels?.length > 0) {
        const firstChannelId = res.data.channels[0]._id;
        handleChannelSelect(firstChannelId);
      }
    } catch (err) {
      console.error('Error fetching workspace details:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    }
  }, [navigate]);

  const handleChannelSelect = useCallback(async (channelId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/channels/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Channel details:', res.data); // Debug log
      setSelectedChannel(channelId);
      setMessages(res.data.messages || []); // Ensure messages is an array
      socket.emit('joinChannel', channelId);
    } catch (err) {
      console.error('Error fetching channel details:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    }
  }, [navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage || !selectedChannel) {
      console.error('Message content or selected channel is missing');
      return;
    }

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
      console.log('Message sent via HTTP:', res.data);

      // Let Socket.IO handle adding the message to the UI
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <header className="header">
        <h1>PeerSync</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      {error && <p className="error">{error}</p>}
      <div className="main-content">
        <div className="sidebar">
          <h3>Workspaces</h3>
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
                {messages.map((msg, index) => (
                  <li key={msg._id || index}>
                    <strong>{msg.sender?.email || 'Unknown'}:</strong> {msg.content}
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