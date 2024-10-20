"use strict";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isOpen && event?.type === "project") {
      console.log("EditProjectModal opened, event data:", event);

      // Pre-fill the fields
      setName(event.title || "");
      setDescription(event.description || "");

      // Debug the raw start and end dates coming from the event
      console.log("Raw start date from event:", event.start);
      console.log("Raw end date from event:", event.end);

      // If start date exists, set it
      if (event.start) {
        const formattedStartDate = new Date(event.start)
          .toISOString()
          .slice(0, 10);
        console.log("Formatted start date:", formattedStartDate);
        setStartDate(formattedStartDate);
      } else {
        console.log("No start date provided.");
        setStartDate(""); // Clear the field if no start date
      }

      // If end date exists, set it
      if (event.end) {
        const formattedEndDate = new Date(event.end).toISOString().slice(0, 10);
        console.log("Formatted end date:", formattedEndDate);
        setEndDate(formattedEndDate);
      } else {
        console.log("No end date provided.");
        setEndDate(""); // Clear the field if no end date
      }
    }
  }, [isOpen, event]);

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

    // Get the current date (today) and log it for debugging
    const today = new Date().toISOString().slice(0, 10); // Format as YYYY-MM-DD

    // Format endDate for comparison
    const formattedEndDateForComparison = new Date(endDate)
      .toISOString()
      .slice(0, 10); // Format as YYYY-MM-DD

    // Check if endDate is before today
    if (formattedEndDateForComparison < today) {
      alert("Selected End Date is in the past.");
      // You can prevent saving by adding "return;" if needed
    }

    try {
      // Simply use the date as-is without forcing to UTC
      const formattedStartDate = new Date(startDate + "T12:00:00"); // Local time
      const formattedEndDate = new Date(endDate + "T12:00:00"); // Local time

      // Log the formatted dates
      console.log("Formatted start date for save:", formattedStartDate);
      console.log("Formatted end date for save:", formattedEndDate);

      // Only send fields that have values
      const updatedFields = {
        name: name.trim() ? name : event.name,
        description: description.trim() ? description : event.description,
        start_date: formattedStartDate,
        due_date: formattedEndDate,
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
      <div className="modal-content">
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
