import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const normalizedEmail = email.toLowerCase(); // Normalize email to lowercase
      const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("Hashed Password:", hashedPassword); // Debugging hashed password
      const response = await axios.post("http://localhost:5000/api/auth/signup", { email: normalizedEmail, password }); // Full URL
      localStorage.setItem("token", response.data.token);
      navigate("/workspace");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signup-form">
      <h2>Signup</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁‍🗨" : "👁️"}
          </button>
        </div>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;