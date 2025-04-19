// src/components/Workspace.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import validateToken from "../utils/validateToken";

const Workspace = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!validateToken()) {
      navigate("/login"); // Redirect to login if token is invalid
    }
  }, [navigate]);

  return <div>Welcome to the Workspace!</div>;
};

export default Workspace;
