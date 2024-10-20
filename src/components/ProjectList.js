import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuth from '../hooks/useAuth';

const ProjectList = () => {
  const { token } = useAuth(); // Get the token using the useAuth hook
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get('/projects', {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
        });
        setProjects(response.data.projects); // Adjust based on your API structure
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    if (token) {
      fetchProjects(); // Fetch projects only if a token is available
    }
  }, [token]); // Dependency array includes token, so it refetches if the token changes

  return (
    <div>
      <h1>Project List</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>{project.name}</li> // Adjust based on your project's structure
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
