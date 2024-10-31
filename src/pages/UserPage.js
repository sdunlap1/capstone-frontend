import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

const UserPage = () => {
  const { token, user } = useAuth(); // Extract token and user from useAuth hook
  const [userInfo, setUserInfo] = useState(null);
  const [firstName, setFirstName] = useState(""); // State for first name
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get("/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, [token]);

  if (!userInfo) {
    return <p>Loading user info...</p>;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    // Trim the values to ensure no whitespace is treated as a valid input
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Check if both email and password fields are empty
    if (
      !trimmedFirstName &&
      !trimmedLastName &&
      !trimmedEmail &&
      !trimmedPassword
    ) {
      setErrorMessage("At least one field (email or password) is required.");
      return;
    }

    try {
      const updatedInfo = {
        first_name: trimmedFirstName || userInfo.first_name,
        last_name: trimmedLastName || userInfo.last_name,
        email: trimmedEmail ? trimmedEmail : userInfo.email, // Keep original email if field is empty
        ...(trimmedPassword && { password: trimmedPassword }),
      };

      await axiosInstance.put("/user", updatedInfo); // Send the updated data to the backend

      // Update user info to reflect changes without a page refresh
      setUserInfo((currentInfo) => ({
        ...currentInfo,
        ...updatedInfo,
      }));

      setSuccessMessage("User information updated successfully!");
      setErrorMessage("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error updating user information:", error);

      // Check for specific error messages from the backend
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message;

        if (errorMessage === "Email already in use") {
          setErrorMessage(
            "The email is already in use. Please choose another."
          );
        } else {
          setErrorMessage("Failed to update user information.");
        }
      } else {
        setErrorMessage("An unknown error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="form-container">
      <div className="user-info">
        <h1 className="heading">User Information</h1>
        <p className="heading-info">
          <strong>First Name:</strong> {userInfo.first_name}
          <br />
          <strong>Last Name:</strong> {userInfo.last_name}
          <br />
          <strong>Username:</strong> {userInfo.username}
          <br />
          <strong>Email:</strong> {userInfo.email}
        </p>

        <h1 className="heading">Edit Your Information</h1>

        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <form onSubmit={handleSave}>
          <label>
            First Name:
            <input
              className="edit-info"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Change First Name"
            />
          </label>
          <br />
          <label>
            Last Name:
            <input
              className="edit-info"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Change Last Name"
            />
          </label>
          <br />
          <label>
            Email:
            <input
              className="edit-info"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Change Email Address"
            />
          </label>
          <br />
          <label>
            New Password:
            <input
              className="edit-info"
              type="password"
              placeholder="Leave blank if you don't want to change"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <br />
          <button className="auth-button" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserPage;
