import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState([]);
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

      // Handle server validation errors or custom errors
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message;

        // Separate checks for username and email already in use
        if (errorMessage === "Username already taken") {
          setErrors([{ msg: "The username is already taken. Please choose another." }]);
        } else if (errorMessage === "Email already in use") {
          setErrors([{ msg: "The email is already in use. Please choose another." }]);
        } else if (error.response.data.errors) {
          // Handle validation errors for empty fields, invalid email, and short password
          setErrors(error.response.data.errors);
        }
      } else {
        setErrors([{ msg: "An unknown error occurred. Please try again." }]);
      }
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
      <h1 className="heading">Signup</h1>
    {/* Display all errors */}
    {errors.length > 0 && (
        <div style={{ color: 'red' }}>
          {errors.map((error, index) => (
            <p key={index}>{error.msg}</p>
          ))}
        </div>
      )}
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
        <button className="auth-button" type="submit">Sign Up</button>
      </form>
      </div>
    </div>
  );
};

export default SignupForm;
