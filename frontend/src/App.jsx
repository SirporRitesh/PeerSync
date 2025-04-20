// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Workspace from './components/Workspace';

const App = () => {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/workspace" /> : <Login />} />
          <Route path="/signup" element={token ? <Navigate to="/workspace" /> : <Signup />} />
          <Route path="/workspace" element={token ? <Workspace /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={token ? "/workspace" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;