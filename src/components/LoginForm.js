import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [invalidUnPw, setInvalidUnPw] = useState(false);
  const [emptyFields, setEmptyFields] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    setInvalidUnPw(false);
    setEmptyFields(false);

    if (!trimmedUsername || !trimmedPassword) {
      setEmptyFields(true);
      return;
    }

    try {
      const user = await login(trimmedUsername, trimmedPassword); // Use trimmed values here
      localStorage.setItem("token", user.token);
      // Redirect to dashboard by default after login
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setInvalidUnPw(true);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h1 className="heading">Please Login</h1>
        {emptyFields && (
         <div className="error-text">Please fill out all fields.</div>
        )}
        {invalidUnPw && (
          <div className="error-text">Invalid username or password.</div>
        )}
    <form onSubmit={handleLogin}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        autoComplete="username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
      />
      <button className="auth-button" type="submit">Login</button>
    </form>
    </div>
    </div>
  );
};

export default LoginForm;
