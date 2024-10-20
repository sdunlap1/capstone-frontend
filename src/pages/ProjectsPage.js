import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectList from '../components/ProjectList';
import useAuth from '../hooks/useAuth';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleAddProject = () => {
    navigate('/add-project');
  };

  return (
    <div>
      <h1>Projects</h1>
      {/* Ensure that ProjectList is only rendered if a token is available */}
      {token ? (
        <>
          <ProjectList />
          <button onClick={handleAddProject}>Add New Project</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProjectsPage;
