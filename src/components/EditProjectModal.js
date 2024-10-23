"use strict";

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

const EditProjectModal = ({ isOpen, event, onClose, onProjectUpdated }) => {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [nameError, setNameError] = useState(false);
  const [startDateError, setStartDateError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);
  const [alertShown, setAlertShown] = useState(false); // This flag ensures the alert only shows once
  const [completed, setCompleted] = useState(false);

  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && event?.type === "project") {
      // Pre-fill the fields
      setName(event.title || "");
      setDescription(event.description || "");
      setCompleted(event.completed || false);
      setAlertShown(false);

      // If start date exists, set it
      if (event.start) {
        const formattedStartDate = new Date(event.start)
          .toISOString()
          .slice(0, 10);
        setStartDate(formattedStartDate);
      } else {
        setStartDate(""); // Clear the field if no start date
      }

      // If end date exists, set it
      if (event.end) {
        const formattedEndDate = new Date(event.end).toISOString().slice(0, 10);
        setEndDate(formattedEndDate);
      } else {
        setEndDate(""); // Clear the field if no end date
      }
    }
  }, [isOpen, event]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside the modal content
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose(); // Trigger the same logic as Cancel
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSave = async () => {
    if (!event?.project_id) {
      alert("Project ID is missing. Cannot save changes.");
      return;
    }

    let hasError = false;

    // Clear previous error messages
    setNameError(false);
    setStartDateError(false);
    setEndDateError(false);

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
    if (!endDate) {
      setEndDateError(true);
      hasError = true;
    }

    if (hasError) return;
    // Convert the start and end dates to Date objects for comparison
    const selectedStartDate = new Date(startDate + "T12:00:00"); // Assuming the user input is in YYYY-MM-DD format
    const selectedEndDate = new Date(endDate + "T12:00:00"); // Assuming the user input is in YYYY-MM-DD format

    // Check if the end date is before the start date
    if (selectedEndDate < selectedStartDate) {
      alert("End date cannot be before the start date.");
      return; // Prevent the form from being saved
    }

    // Get the current date (today) and log it for debugging
    const today = new Date().toISOString().slice(0, 10); // Format as YYYY-MM-DD

    // Safeguard: Make sure originalEndDate is available and valid
    const originalEndDate = event.end ? event.end.slice(0, 10) : today;

    // Format the new end date selected by the user
    const newEndDate = new Date(endDate)
      .toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" })
      .slice(0, 10);

    // Only show the alert if:
    // 1. The project's original end date was in the future
    // 2. The new selected end date is in the past
    if (!alertShown && originalEndDate >= today && newEndDate < today) {
      alert("Warning: End date is in the past.");
      setAlertShown(true); // Mark that the alert has been shown
    }

    try {
      // Simply use the date as-is without forcing to UTC
      const formattedStartDate = new Date(startDate + "T12:00:00"); // Local time
      const formattedEndDate = new Date(endDate + "T12:00:00"); // Local time

      // Only send fields that have values
      const updatedFields = {
        name: name.trim() ? name : event.name,
        description: description.trim() ? description : event.description,
        start_date: formattedStartDate,
        due_date: formattedEndDate,
        completed,
      };

      await axiosInstance.put(`/projects/${event.project_id}`, updatedFields, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Project updated successfully!");
      onProjectUpdated(); // Refresh the events after updating
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update the project. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!event?.project_id) {
      alert("Project ID is missing. Cannot delete this project.");
      return;
    }

    try {
      await axiosInstance.delete(`/projects/${event.project_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Project deleted successfully!");
      onProjectUpdated(); // Refresh the events after deletion
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete the project. Please try again.");
    }
  };

  const handleClose = () => {
    // Clear error messages
    setNameError(false);
    setStartDateError(false);
    setEndDateError(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content" ref={modalRef}>
        <h2>Edit Project</h2>
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
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        {startDateError && (
          <span className="error-text">Start date is required</span>
        )}
        <label>End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {endDateError && (
          <span className="error-text">End date is required</span>
        )}
        <label>
          <input
            type="checkbox"
            checked={completed} // Checkbox to mark as complete
            onChange={(e) => setCompleted(e.target.checked)}
          />
          Mark as Completed
        </label>
        <button onClick={handleSave}>Save</button>
        <button className="delete-button" onClick={handleDelete}>
          Delete
        </button>
        <button onClick={handleClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditProjectModal;
