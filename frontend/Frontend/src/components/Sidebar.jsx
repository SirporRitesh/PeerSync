import React from "react";

const Sidebar = ({ workspaceName, channels }) => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        {workspaceName || "Workspace"}
      </div>
      <div className="flex-1 overflow-y-auto">
        <h3 className="px-4 py-2 text-sm text-gray-400">Channels</h3>
        <ul>
          {channels.map((channel, idx) => (
            <li key={idx} className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
              # {channel}
            </li>
          ))}
        </ul>
      </div>
      <button className="p-4 border-t border-gray-700 hover:bg-gray-700 text-left">
        + Add Channel
      </button>
    </div>
  );
};

export default Sidebar;
