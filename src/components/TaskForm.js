import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';  
import useAuth from '../hooks/useAuth';

const TaskForm = () => {
  const { token } = useAuth();  // Get the token for authorization
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        '/tasks',
        { title, description, due_date: dueDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Include the token in the request headers
          },
        }
      );
      console.log('Task created:', response.data);
      // Reset form or perform additional actions
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <button type="submit">Create Task</button>
    </form>
  );
};

export default TaskForm;
