// src/index.js
import React from "react";
import ReactDOM from "react-dom/client"; // Import from "react-dom/client" for React 18
import App from "./App"; // Import the main App component
import './styles/style.css'; // Import the global CSS for styling

const root = ReactDOM.createRoot(document.getElementById("root")); // Create a root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
