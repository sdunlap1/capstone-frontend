import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import { useClickOutSide } from "../hooks/useClickOutSide";

const AddProjectModal = ({ isOpen, onClose, onProjectAdded }) => {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [nameError, setNameError] = useState(false);
  const [startDateError, setStartDateError] = useState(false);
  const [dueDateError, setDueDateError] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const modalRef = useRef(null);

  useClickOutSide(modalRef, isOpen, onClose);

  const handleSave = async () => {
    if (isSaving) return;

    try {
      let hasError = false;

      // Clear previous error messages
      setNameError(false);
      setStartDateError(false);
      setDueDateError(false);

      // Check if name is empty
      if (!name.trim()) {
        setNameError(true);
        hasError = true;
      }

      // Check for empty Start Date
      if (!startDate) {
        setStartDateError(true);
        hasError = true;
      }

      // Check for End Date
      if (!dueDate) {
        setDueDateError(true);
        hasError = true;
      }

      if (hasError) return;

      // Get today's date for comparison (formatted as YYYY-MM-DD)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Simply use the date as-is without forcing to UTC
      const formattedStartDate = new Date(startDate + "T12:00:00"); // Local time
      const formattedDueDate = new Date(dueDate + "T12:00:00"); // Local time

      // Check if due date is before start date
      if (formattedDueDate < formattedStartDate) {
        alert("The due date cannot be earlier than the start date.");
        return; // Prevent saving if this condition is true
      }

      setIsSaving(true);
      const response = await axiosInstance.post(
        "/projects",
        {
          name,
          description,
          start_date: formattedStartDate, // Send as ISO string
          due_date: formattedDueDate, // Send as ISO string
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Check if due date is in the past
      const projectId = response.data.project.project_id;
      const notificationKey = `notifiedPastDate_${projectId}`;

      if (
        !localStorage.getItem(notificationKey) &&
        formattedDueDate < today
      ) {
        alert("Warning: End date is in the past.");
        localStorage.setItem(notificationKey, "true");
      }

      onProjectAdded(); // Refresh the calendar
      setSavedMessage(true);

      setTimeout(() => {
        setSavedMessage(false);
        setIsSaving(false);
        handleCancel(); // Clear all fields on cancel
      }, 3000);
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add the project. Please try again.");
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setDueDate("");
    // Clear any error messages
    setNameError(false);
    setStartDateError(false);
    setDueDateError(false);
    onClose(); // Close the modal
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
          <h2>Add New Project</h2>
          {/* Saved Message */}
          {savedMessage && (
            <div className="saved-message">Project saved successfully!</div>
          )}
          {nameError && (
            <span className="error-text">Project name is required</span>
          )}
          <input
            type="text"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={nameError ? "input-error" : undefined}
          />
          <label>Start Date</label>
          {startDateError && (
            <span className="error-text">Start date is required</span>
          )}
          <input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={startDateError ? "input-error" : undefined}
          />
          <label>End Date</label>
          {dueDateError && (
            <span className="error-text">End date is required</span>
          )}
          <input
            type="date"
            placeholder="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={dueDateError ? "input-error" : undefined}
          />
          <label>Description</label>
          <textarea
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button onClick={handleSave} disabled={isSaving}>
            Save
          </button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
