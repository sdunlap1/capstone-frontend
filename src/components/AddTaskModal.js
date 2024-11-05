"use strict"

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import { useClickOutSide } from "../hooks/useClickOutSide";

const AddTaskModal = ({ isOpen, onClose, onTaskAdded, selectedDate }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(selectedDate || ""); // Separate date input
  const [dueTime, setDueTime] = useState(""); // Separate time input
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [dueDateError, setDueDateError] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const modalRef = useRef(null); // Used to track the modal window state.

  useClickOutSide(modalRef, isOpen, onClose);

  const handleSave = async () => {
    if (isSaving) return;
    let hasError = false;

    // Clear previous error messages
    setTitleError(false);
    setDueDateError(false);

    // Check if title is empty
    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    }

    // Check if due date is empty
    if (!dueDate) {
      setDueDateError(true);
      hasError = true;
    }
    if (hasError) return;

    // Get today's date in Los Angeles timezone, formatted as YYYY-MM-DD
    const today = new Date()
      .toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
      .slice(0, 10);

    // Parse selected due date in local timezone, adjusting for time difference
    const selectedDueDate = new Date(`${dueDate}T${dueTime || "00:00"}`)
      .toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
      .slice(0, 10);

    console.log("Today's date:", today); // Debugging statement
    console.log("Selected dueDate:", selectedDueDate); // Debugging statement

    // Check if the selected due date is in the past
    if (selectedDueDate < today) {
      alert("Warning: The due date is in the past.");
      // Still allow saving, just showing the warning
    }

    try {
      setIsSaving(true); // Set cooldown
      // Format the due date to include time
      const localDueDate = new Date(`${dueDate}T${dueTime}`);
      const formattedDueDate = localDueDate.toISOString(); // Converts to full ISO format for database

      await axiosInstance.post(
        "/tasks",
        {
          title,
          due_date: formattedDueDate, // Send combined due date and time
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onTaskAdded(); // Refresh the calendar with the new task
      setSavedMessage(true); 
      
      setTimeout(() => {
        setSavedMessage(false);
        setIsSaving(false);
        handleClose(); // Clear all fields on Cancel
      }, 3000);

    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add the task. Please try again.");
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDueDate(selectedDate || ""); // Reset the date
    setDueTime(""); // Reset the time to the default value
    setDescription("");
    // Clear any error messages
    setTitleError(false);
    setDueDateError(false);
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
    <div className="modal">
      <div className="modal-content" 
      ref={modalRef}
      onClick={(e) => e.stopPropagation()}
      >
        <h2>Add New Task</h2>
        {/* Saved Message */}
        {savedMessage && (
          <div className="saved-message">
            Task saved successfully!
          </div>
        )}
        <label>Task Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={titleError ? "input-error" : ""}
        />
        {titleError && (
          <span className="error-text">Task title is required</span>
        )}
        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={dueDateError ? "input-error" : ""}
        />
        {dueDateError && (
          <span className="error-text">Due date is required</span>
        )}
        <label>Time</label>
        <input
          type="time"
          value={dueTime} // Separate time input
          onChange={(e) => setDueTime(e.target.value)}
        />
        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleSave} disabled={isSaving}>Save</button>
        <button onClick={handleClose}>Cancel</button>
      </div>
    </div>
    </div>
  );
};

export default AddTaskModal;