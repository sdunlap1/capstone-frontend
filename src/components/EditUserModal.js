"use strict";

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import { useClickOutSide } from "../hooks/useClickOutSide";

const EditUserModal = ({ isOpen, user, onClose, onUserUpdated }) => {
  const { token } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errors, setErrors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const modalRef = useRef(null);

  useClickOutSide(modalRef, isOpen, onClose);

  // Populate fields when modal opens
  useEffect(() => {
    if (isOpen && user) {
      console.log("Populating EditUserModal with userInfo:", user);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setEmailError("");
      setPasswordError("");
      setErrors([]);
    }
  }, [isOpen, user]);

  const handleClose = () => {
    console.log("Modal close triggered");
    setEmailError("");
    setPasswordError("");
    setErrors([]);
    onClose();
  };

  const handleSave = async () => {
    if (isSaving) return;

    const inputFields =
      !firstName.trimEnd() &&
      !lastName.trim() &&
      !email.trim() &&
      !password.trim();

    if (inputFields) {
      setErrors(["You must enter at least one field to save changes"]);
      return;
    }

    let hasError = false;
    setErrors();

    if (hasError) return;

    const updatedInfo = {
      first_name: firstName.trim() || user?.first_name,
      last_name: lastName.trim() || user?.last_name,
      email: email.trim() || user?.email,
      password: password ? password.trim() : undefined,
    };
    console.log("Payload being sent to the server:", updatedInfo);
    try {
      setIsSaving(true);
      setEmailError("");
      setPasswordError("");
      setErrors([]);

      await axiosInstance.put("/user", updatedInfo, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // if (response.status === 200) {
      onUserUpdated(updatedInfo); // Ensure dashboard updates immediately
      setSavedMessage(true);

      setTimeout(() => {
        setSavedMessage(false);
        setIsSaving(false);
        handleClose();
      }, 1500);
      // }
    } catch (error) {
      setIsSaving(false);
      console.error("Error updating user information:", error);

      if (error.response && error.response.status === 400) {
        const errorResponse = error.response.data.errors;

        // Handle field-specific validation errors
        if (Array.isArray(errorResponse)) {
          let fieldErrors = [];

          errorResponse.forEach((err) => {
            if (err.param === "email") {
              setEmailError(err.msg); // Set email-specific error
            } else if (err.param === "password") {
              setPasswordError(err.msg); // Set password-specific error
            } else {
              fieldErrors.push(err.msg);
            }
          });

          if (fieldErrors.length > 0) {
            setErrors(fieldErrors);
          }
        } else if (error.response.data.message === "Email already in use") {
          setEmailError("The email is already in use.");
        } else {
          setErrors(["Failed to update user information."]);
        }
      } else {
        setErrors(["Failed to update user information."]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div
          className="modal-content"
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Display general error messages */}
          {errors.length > 0 && (
            <div style={{ color: "red" }}>
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
          {savedMessage && (
            <div className="saved-message">User updated successfully!</div>
          )}
          <h2>Edit User Information</h2>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {emailError && <p style={{ color: "red" }}>{emailError}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(""); // Clear error on input change
              setErrors([]);
            }}
          />
          {/* {passwordError && <p style={{ color: "red" }}>{passwordError}</p>} */}
          <input
            type="password"
            placeholder="New Password (optional)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(""); // Clear error on input change
              setErrors([]);
            }}
          />

          <button onClick={handleSave} disabled={isSaving}>
            Save
          </button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
