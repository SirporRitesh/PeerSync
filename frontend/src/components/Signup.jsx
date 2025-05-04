// components/Signup.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }
    const commonPasswords = ["password123", "qwerty123", "abc123"];
    if (commonPasswords.includes(password.toLowerCase())) {
      return "This password is too common. Please choose a more secure password.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sanitizedEmail = email.trim().toLowerCase();
      const signupResponse = await axios.post("http://localhost:5000/api/auth/signup", { email: sanitizedEmail, password });
      console.log('Signup response:', signupResponse.data);

      const loginResponse = await axios.post("http://localhost:5000/api/auth/login", { email: sanitizedEmail, password });
      localStorage.setItem("token", loginResponse.data.token);
      console.log('Token stored in localStorage:', localStorage.getItem('token'));
      navigate("/workspace", { replace: true });
    } catch (err) {
      console.error("Signup Error:", err);
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
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;