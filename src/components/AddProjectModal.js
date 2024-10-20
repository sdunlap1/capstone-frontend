import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';

const AddProjectModal = ({ isOpen, onClose, onProjectAdded }) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSave = async () => {
    
    // Get today's date for comparison (formatted as YYYY-MM-DD)
    const today = new Date().toISOString().slice(0, 10);
    console.log("Today's date:", today);

    // Check if due date is in the past
    if (dueDate < today) {
      alert('Warning: Due date is in the past.');
    }

    // Check if due date is before start date
    if (dueDate < startDate) {
      alert('The due date cannot be earlier than the start date.');
      return; // Prevent saving if this condition is true
    }

    // Format the start and due dates as UTC ISO strings
    const formattedStartDate = new Date(startDate + 'T12:00:00').toISOString(); // Force UTC
    const formattedDueDate = new Date(dueDate + 'T12:00:00').toISOString(); // Force UTC

    try {
      await axiosInstance.post(
        '/projects',
        {
          name,
          description,
          start_date: formattedStartDate,  // Send as ISO string
          due_date: formattedDueDate,  // Send as ISO string
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
      console.error('Error adding project:', error);
      alert('Failed to add the project. Please try again.');
    }
  };
  const handleCancel = () => {
    setName('');
    setDescription('');
    setStartDate('');
    setDueDate('');
    onClose(); // Close the modal
  }

  if (!isOpen) return null;

  return (
    <div className="modal top-modal">
      <div className="modal-content">
        <h2>Add New Project</h2>
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <label>End Date</label>
        <input
          type="date"
          placeholder="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button onClick={handleSave} disabled={!name || !dueDate || !startDate}>
          Save
        </button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default AddProjectModal;
