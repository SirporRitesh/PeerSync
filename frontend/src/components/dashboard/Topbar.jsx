import React from 'react';

const Topbar = ({ workspaceName = "PeerSync Workspace" }) => {
  return (
    <div className="h-16 bg-white flex items-center justify-between px-6 shadow">
      <h2 className="text-xl font-semibold text-gray-800">{workspaceName}</h2>
      <div className="flex items-center space-x-4">
        {/* Placeholder for Search or Notifications */}
        {/* <input type="text" placeholder="Search" className="border rounded px-2 py-1" /> */}
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
          <span className="text-sm font-bold">U</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
