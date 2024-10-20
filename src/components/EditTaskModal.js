"use strict";

import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

const EditTaskModal = ({ isOpen, event, onClose, onTaskUpdated }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("12:00");

  useEffect(() => {
    if (isOpen && event?.type === "task") {
      console.log("due_date from event:", event.due_date);
      // Log the due_date to verify what's coming from the backend
      setTitle(event.title || ""); // Pre-fill the title field
      setDescription(event.description || ""); // Pre-fill the description field

      // Pre-fill due_date if exists
      if (event.due_date) {
        const dueDateObj = new Date(event.due_date);

        setDueDate(dueDateObj.toISOString().slice(0, 10)); // Extract date (YYYY-MM-DD)

        // Adjust the time manually using timezone offset
        const localTime = new Date(
          dueDateObj.getTime() - dueDateObj.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(11, 16); // Extract local time in HH:MM format
        setDueTime(localTime);
      } else {
        setDueDate("");
        setDueTime("12:00");
      }
    }
  }, [isOpen, event]);

  const handleSave = async () => {
    if (!event?.id) {
      alert("Task ID is missing. Cannot save changes.");
      return;
    }
    if (!title.trim()) {
      alert("Task title is required");
      return;
    }
    if (!dueDate) {
      alert("Due Date is required");
      return;
    }

    // Combine the date and time inputs into a single ISO string
    const localDueDate = new Date(`${dueDate}T${dueTime}`);
    const formattedDueDate = localDueDate.toISOString(); // Convert to ISO format

    const updatedFields = {
      title: title.trim() ? title : event.title,
      description: description.trim() ? description : event.description,
      due_date: formattedDueDate, // Correct variable name here
    };

    // Get today's date in Los Angeles timezone
    const today = new Date()
      .toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
      .slice(0, 10);

    // Format the selected due date with the appropriate time and timezone
    const selectedDueDate = new Date(`${dueDate}T${dueTime || "00:00"}`)
      .toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })
      .slice(0, 10);

    console.log("Today's date:", today);
    console.log("Selected dueDate:", selectedDueDate);

    // Check if due date is in the past
    if (selectedDueDate < today) {
      alert("Warning: Due date is in the past.");
      // Allow saving, just showing a warning
    }

    try {
      console.log("Title:", title);
      console.log("Description:", description);
      console.log("Due Date being sent:", formattedDueDate); // Corrected logging

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

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Task</h2>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <label>Time</label>
        <input
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
        />
        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleSave}>
          Save
        </button>
        <button className="delete-button" onClick={handleDelete}>
          Delete
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditTaskModal;
