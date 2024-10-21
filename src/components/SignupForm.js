import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/signup", {
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
      });

      const { token } = response.data;

      // Save the token to localStorage
      localStorage.setItem("token", token);

      // Redirect to user page after signup
      navigate("/user");
    } catch (error) {
      console.error("Error signing up:", error);
      
      // Check for specific error messages from the backend
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message;

        if (errorMessage === "Username already taken") {
          setError("The username is already taken. Please choose another.");
        } else if (errorMessage === "Email already in use") {
          setError("The email is already in use. Please choose another.");
        } else {
          setError("Failed to sign up. Please ensure all fields are correct.");
        }
      } else {
        setError("An unknown error occurred. Please try again later.");
      }
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSignup}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignupForm;
