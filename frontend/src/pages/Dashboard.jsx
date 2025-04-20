// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import ChatBox from '../components/dashboard/ChatBox';
import '../styles/dashboard.css'; // Import the new CSS

function Dashboard() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/workspace/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkspace(response.data);
        if (response.data.channels && response.data.channels.length > 0) {
          setSelectedChannel(response.data.channels[0]);
        }
      } catch (err) {
        console.error('Error fetching workspace:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchWorkspace();
  }, [workspaceId, navigate]);

  if (!workspace) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Leftmost Toolbar */}
      <div className="w-16 bg-purple-950 flex flex-col items-center py-4">
        <div className="text-2xl font-bold mb-8">P</div>
        <div className="mt-auto w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          {workspace.members.find(member => member.userId._id === localStorage.getItem('userId'))?.userId.email[0].toUpperCase() || 'U'}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        workspace={workspace}
        setSelectedChannel={setSelectedChannel}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar />
        {selectedChannel ? (
          <ChatBox channel={selectedChannel} workspaceId={workspaceId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select a channel to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;