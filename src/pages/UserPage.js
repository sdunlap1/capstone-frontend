import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';

const UserPage = () => {
  const { token, user } = useAuth();  // Extract token and user from useAuth hook
  const [userInfo, setUserInfo] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get('/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [token]);

  if (!userInfo) {
    return <p>Loading user info...</p>;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updatedInfo = {
        email,
        ...(password && { password }), // Only include password if it's being changed
      };

      await axiosInstance.put("/user", updatedInfo); // Send the updated data to the backend

      setSuccessMessage("User information updated successfully!");
      setErrorMessage("");
    } catch (error) {
      console.error("Error updating user information:", error);
      setErrorMessage("Failed to update user information.");
    }
  };

  return (
    <div>
      <h1>User Information</h1>
      <p><strong>Username:</strong> {userInfo.username}</p>
      <p><strong>Email:</strong> {userInfo.email}</p>
    
    <h1>Edit Your Information</h1>

    {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

    <form onSubmit={handleSave}>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <br />
      <label>
        New Password:
        <input
          type="password"
          placeholder="Leave blank if you don't want to change"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <button type="submit">Save Changes</button>
    </form>
  </div>
  );
};

export default UserPage;
