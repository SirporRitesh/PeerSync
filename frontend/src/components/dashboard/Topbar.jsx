// frontend/src/components/dashboard/Topbar.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        setUser({ email: decoded.email || 'User' });
        localStorage.setItem('userId', decoded.userId); // Store userId for message sending
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="topbar h-16 bg-gray-800 flex items-center justify-between px-6 border-b border-gray-700">
      <h2 className="text-xl font-semibold text-white">PeerSync Workspace</h2>
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center cursor-pointer">
          <span className="text-sm font-bold text-white">
            {user?.email[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;