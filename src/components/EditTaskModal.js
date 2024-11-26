"use strict";

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import { useClickOutSide } from "../hooks/useClickOutSide";

const EditTaskModal = ({ isOpen, event, onClose, onTaskUpdated }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [dueDateError, setDueDateError] = useState(false);
  const [dueTimeError, setDueTimeError] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const modalRef = useRef(null); // Track the modal window State

  useClickOutSide(modalRef, isOpen, onClose);

  // Populate fields when modal opens
  useEffect(() => {
    if (isOpen && event?.type === "task") {
      console.log("Raw dog:", event);
      setTitle(event.title || ""); // Pre-fill title field
      setDescription(event.description || ""); // Pre-fill description field
      setCompleted(event.completed || false); // Pre-fill completed state

      if (event.due_date) {
        const dueDateObj = new Date(event.due_date);

        // Extract local Date (YYYY-MM-DD)
        const localYear = dueDateObj.getFullYear();
        const localMonth = (dueDateObj.getMonth() + 1)
          .toString()
          .padStart(2, "0");
        const localDay = dueDateObj.getDate().toString().padStart(2, "0");
        const localDueDate = `${localYear}-${localMonth}-${localDay}`;
        setDueDate(localDueDate);

        // Extract local time (HH:MM)
        const localHours = dueDateObj.getHours().toString().padStart(2, "0");
        const localMinutes = dueDateObj
          .getMinutes()
          .toString()
          .padStart(2, "0");
        const dueTime = `${localHours}:${localMinutes}`;

        setDueTime(dueTime);
      } else {
        setDueDate("");
        setDueTime("");
      }
    }
  }, [isOpen, event]);

  const handleClose = () => {
    // Clear error messages
    setTitleError(false);
    setDueDateError(false);
    setDueTimeError(false);
    onClose();
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!event?.task_id) {
      alert("Task ID is missing. Cannot save changes.");
      return;
    }

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

    // Combine the date and time inputs into a single local time Date object
    const localDueDate = new Date(`${dueDate}T${dueTime}`); // This assumes the dueDate and dueTime are already local.
    const formattedDueDate = new Date(
      localDueDate.getTime() - localDueDate.getTimezoneOffset() * 60000
    ).toISOString(); // Adjust to UTC for ISO format
    console.log("Formatted Due Date Being Sent:", formattedDueDate);

    const updatedFields = {
      title: title.trim() ? title : event.title,
      description: description.trim() ? description : event.description,
      due_date: formattedDueDate, // Send full date and time
      completed,
    };

    // Get today's date in Los Angeles timezone
    const today = new Date()
      .toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" })
      .slice(0, 10);

    // Format the current due date (before edit) and the new one the user selected
    const originalDueDate = event.due_date.slice(0, 10);
    const newDueDate = new Date(dueDate)
      .toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" })
      .slice(0, 10);

    // Only show the alert if:
    // 1. The task's original due date was in the future
    // 2. The new selected due date is in the past
    if (originalDueDate >= today && newDueDate < today) {
      alert("Warning: Due date is in the past.");
      // Allow saving, just showing a warning
    }

    try {
      setIsSaving(true);

      await axiosInstance.put(`/tasks/${event.task_id}`, updatedFields, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onTaskUpdated(); // Refresh the task list
      setSavedMessage(true);

      setTimeout(() => {
        setSavedMessage(false);
        setIsSaving(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update the task. Please try again.");
      setIsSaving(false);
      return;
    }
  };

  const handleDelete = async () => {
    if (!event?.task_id) {
      console.error("Task ID is missing for deletion:", event);
      alert("Task ID is missing. Cannot delete this task.");
      return;
    }

    try {
      await axiosInstance.delete(`/tasks/${event.task_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Task deleted successfully!");
      onTaskUpdated(); // Refresh the events after deletion
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete the task. Please try again.");
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
          <h2>Edit Task</h2>
          {/* Saved Message */}
          {savedMessage && (
            <div className="saved-message">Task updated successfully!</div>
          )}
          {titleError && (
            <span className="error-text">Task title is required</span>
          )}
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`input-field ${titleError ? "input-error" : ""}`}
          />

          <label>Due Date</label>
          {dueDateError && (
            <span className="error-text">Due date is required</span>
          )}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`input-field ${dueDateError ? "input-error" : ""}`}
          />

          <label>Time</label>
          {dueTimeError && <span className="error-text">Time is required</span>}
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className={`input-field ${dueTimeError ? "input-error" : ""}`}
          />
          <label>Description</label>
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="checkbox"
            checked={completed} // Checkbox to mark as complete
            onChange={(e) => {
              setCompleted(e.target.checked);
            }}
          />
          <label>Mark as Completed</label>
          <button onClick={handleSave} disabled={isSaving}>
            Save
          </button>
          <button className="delete-button" onClick={handleDelete}>
            Delete
          </button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
