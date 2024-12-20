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
  const [dueTimeError, setDueTimeError] = useState(false);
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
    setDueTimeError(false);

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

    // Check if time is empty (time is always required)
    if (!dueTime) {
      setDueTimeError(true);
      hasError = true;
    }

    if (hasError) return;

    const localDueDate = new Date(`${dueDate}T${dueTime}`);
    const formattedDueDate = localDueDate.toISOString();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the selected due date is in the past
    if (localDueDate < today) {
      alert("Warning: The due date is in the past.");
      // Still allow saving, just showing the warning
    }

    try {
      setIsSaving(true); // Set cooldown
      
      await axiosInstance.post(
        "/tasks",
        {
          title,
          description,
          due_date: formattedDueDate, // Send combined due date and time
          notified_past_due: formattedDueDate < today,
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
    setDueTimeError(false);
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
        {titleError && (
          <span className="error-text">Task title is required</span>
        )}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={titleError ? "input-error" : undefined}
        />
        <label>Due Date</label>
        {dueDateError && (
          <span className="error-text">Due date is required</span>
        )}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={dueDateError ? "input-error" : undefined}
        />
        <label>Time</label>
        {dueTimeError && <span className="error-text">Time is required</span>}
        <input
          type="time"
          value={dueTime} // Separate time input
          onChange={(e) => setDueTime(e.target.value)}
          className={dueTimeError ? "input-error" : undefined}
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