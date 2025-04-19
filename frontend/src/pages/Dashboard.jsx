import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/Topbar';
import ChannelList from '../components/dashboard/ChannelList';
import ChatBox from '../components/dashboard/ChatBox';

const Dashboard = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [messages, setMessages] = useState([
    { sender: 'Admin', text: 'Welcome to PeerSync!', time: '10:00 AM' },
  ]);

  const handleSendMessage = (newMsg) => {
    const msg = {
      sender: 'You',
      text: newMsg,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <TopBar />
        <div className="flex flex-1">
          <ChannelList onSelect={setSelectedChannel} />
          <ChatBox messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
