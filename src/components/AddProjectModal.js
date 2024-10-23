import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

const AddProjectModal = ({ isOpen, onClose, onProjectAdded }) => {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [nameError, setNameError] = useState(false);
  const [startDateError, setStartDateError] = useState(false);
  const [dueDateError, setDueDateError] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside the modal content
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCancel(); // Trigger the same logic as Cancel
      }
    };

    // Add event listener to the document
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener when the modal is closed
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSave = async () => {
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
    const today = new Date(); today.setHours(0, 0, 0, 0);

    // Simply use the date as-is without forcing to UTC
    const formattedStartDate = new Date(startDate + "T12:00:00"); // Local time
    const formattedDueDate = new Date(dueDate + "T12:00:00"); // Local time
    
    // Check if due date is in the past
    if (dueDate < today) {
      alert("Warning: End date is in the past.");
    }
    
    // Check if due date is before start date
    if (dueDate < startDate) {
      alert("The due date cannot be earlier than the start date.");
      return; // Prevent saving if this condition is true
    }

    try {
      await axiosInstance.post(
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

      onProjectAdded(); // Refresh the calendar
      handleCancel(); // Clear all fields on cancel
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add the project. Please try again.");
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
    <div className="modal top-modal">
      <div className="modal-content" ref={(modalRef)}>
        <h2>Add New Project</h2>
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {nameError && (
          <span className="error-text">Project name is required</span>
        )}
        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>Start Date</label>
        <input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        {startDateError && (
          <span className="error-text">Start date is required</span>
        )}
        <label>End Date</label>
        <input
          type="date"
          placeholder="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        {dueDateError && (
          <span className="error-text">End date is required</span>
        )}
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default AddProjectModal;
