"use strict";

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import { useClickOutSide } from "../hooks/useClickOutSide";

const EditProjectModal = ({ isOpen, event, onClose, onProjectUpdated }) => {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [nameError, setNameError] = useState(false);
  const [startDateError, setStartDateError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  
  const modalRef = useRef(null);

  useClickOutSide(modalRef, isOpen, onClose);
  
  useEffect(() => {
    if (isOpen && event?.type === "project") {
      console.log("Raws dog:", event);
      // Pre-fill the fields
      setName(event.title || "");
      setDescription(event.description || "");
      setCompleted(event.completed || false);

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

  const handleClose = () => {
    // Clear error messages
    setNameError(false);
    setStartDateError(false);
    setEndDateError(false);
    onClose();
  };

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
    const today = new Date(); // Format as YYYY-MM-DD
    today.setHours(0, 0, 0, 0);

    // ************** NOT SURE THIS IS REALLY NEEDED ********************

    // Safeguard: Make sure originalEndDate is available and valid
    // const originalEndDate = event.end ? event.end.slice(0, 10) : today;

    // Format the new end date selected by the user
    // const newEndDate = new Date(endDate)
    //   .toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" })
    //   .slice(0, 10);

    // ***********************************************************************

    try {
      setIsSaving(true);

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
        notified_past_due: event.notified_past_due,
      };

      // Adjust `notified_past_due` based on new end date
      if (selectedEndDate >= today) {
        updatedFields.notified_past_due = false;
      } else if (!event.notified_past_due || updatedFields.notified_past_due === false) {
        alert("Warning: End date is in the past.");
        updatedFields.notified_past_due = true;
      }

      await axiosInstance.put(`/projects/${event.project_id}`, updatedFields, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onProjectUpdated(); // Refresh the events after updating
      setSavedMessage(true);

      setTimeout(() => {
        setSavedMessage(false);
        setIsSaving(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update the project. Please try again.");
      setIsSaving(false);
      return;
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

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
    <div className="modal">
      <div className="modal-content" ref={modalRef} onClick={(e) =>
        e.stopPropagation()
      }>
        <h2>Edit Project</h2>
        {/* Saved Message */}
        {savedMessage && (
            <div className="saved-message">Project updated successfully!</div>
          )}
        {nameError && (
          <span className="error-text">Project name is required</span>
        )}
        
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`input-field ${nameError ? "input-error" : ""}`}
        />
       <label>Start Date</label>
        {startDateError && (
          <span className="error-text">Start date is required</span>
        )}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={`input-field ${startDateError ? "input-error" : ""}`}
        />
        <label>End Date</label>
        {endDateError && (
          <span className="error-text">End date is required</span>
        )}
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={`input-field ${endDateError ? "input-error" : ""}`}
        />
        <label>Description</label>
        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
          <input
            type="checkbox"
            checked={completed} // Checkbox to mark as complete
            onChange={(e) => setCompleted(e.target.checked)}
          />
          <label>Mark as Completed</label>
        <button onClick={handleSave} disabled={isSaving}>Save</button>
        <button className="delete-button" onClick={handleDelete}>
          Delete
        </button>
        <button onClick={handleClose}>Cancel</button>
      </div>
    </div>
    </div>
  );
};

export default EditProjectModal;
