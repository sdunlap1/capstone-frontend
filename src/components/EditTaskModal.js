"use strict";

import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

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

  const modalRef = useRef(null); // Track the modal window State



  // Populate fields when modal opens
  useEffect(() => {
    if (isOpen && event?.type === "task") {
      setTitle(event.title || ""); // Pre-fill title field
      setDescription(event.description || ""); // Pre-fill description field
      setCompleted(event.completed || false); // Pre-fill completed state

      // Set the current due date, leave time blank
      if (event.due_date) {
        const dueDateObj = new Date(event.due_date);
        setDueDate(dueDateObj.toISOString().slice(0, 10)); // Populate due date (YYYY-MM-DD)

        // Keep the time blank (require user to fill in)
        setDueTime("");
      } else {
        setDueDate("");
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
    if (!event?.id) {
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

    // Combine the date and time inputs into a single ISO string
    const localDueDate = new Date(`${dueDate}T${dueTime}`);
    const formattedDueDate = localDueDate.toISOString(); // Convert to ISO format

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
      console.log("Due Date being sent:", updatedFields);
      await axiosInstance.put(`/tasks/${event.id}`, updatedFields, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Task updated successfully!");
      onTaskUpdated(); // Refresh the task list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update the task. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!event?.id) {
      console.error("Task ID is missing for deletion:", event);
      alert("Task ID is missing. Cannot delete this task.");
      return;
    }

    try {
      await axiosInstance.delete(`/tasks/${event.id}`, {
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

  const handleClose = () => {
    // Clear error messages
    setTitleError(false);
    setDueDateError(false);
    setDueTimeError(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content" ref={modalRef}>
        <h2>Edit Task</h2>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {titleError && (
          <span className="error-text">Task title is required</span>
        )}

        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        {dueDateError && (
          <span className="error-text">Due date is required</span>
        )}

        <label>Time</label>
        <input
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
        />
        {dueTimeError && <span className="error-text">Time is required</span>}

        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={completed} // Checkbox to mark as complete
            onChange={(e) => {
              setCompleted(e.target.checked);
              console.log("Completed state changed to:", e.target.checked);
            }}
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

export default EditTaskModal;
