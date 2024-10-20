import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import CalendarPage from './pages/CalendarPage';
import UserPage from './pages/UserPage'; 
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import TaskForm from './components/TaskForm';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ProtectedRoute from './components/ProtectedRoute'

import "./styles/App.css";

const HomePage = () => (
  <div>
    <nav>
      <ul>
        <li><Link to="/tasks">Tasks</Link></li>
        <li><Link to="/projects">Projects</Link></li>
        <li><Link to="/add-project">Add Projects</Link></li>
        <li><Link to="/project-list">Projects List</Link></li>
        <li><Link to="/calendar">Calendar</Link></li>
        <li><Link to="/add-task">Add Task</Link></li>
        <li><Link to ="/user">User Info</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to ="/signup">Sign Up</Link></li>
      </ul>
    </nav>
  </div>
);

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />  
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/add-project" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
        <Route path="/project-list" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/add-task" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
        <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
    </div>
  );
};

const RootApp = () => (
  <Router>
    <App />
  </Router>
);

export default RootApp;
