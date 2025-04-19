import React from 'react';
import Sidebar from './components/Sidebar'; // Adjust the path if needed

const App = () => {
  return (
    <div className="app">
      {/* Render Sidebar */}
      <Sidebar />
      {/* You can add other components here for the dashboard */}
      <h1>Welcome to PeerSync Dashboard</h1>
      {/* You can add the main content for the dashboard later */}
    </div>
  );
};

export default App;