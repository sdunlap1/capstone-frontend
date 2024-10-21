import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CalendarPage from './pages/CalendarPage';
import UserPage from './pages/UserPage'; 
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar'; 
import './styles/App.css';
import './styles/Calendar.css';

const HomePage = () => (
  <div>
    <h1>Welcome to the Task Manager</h1>
    <p>Manage your tasks and projects effectively!</p>
  </div>
);

const App = () => {
  return (
    <div className="App">
      <Navbar />
      <div className="main-content">
      <Routes>
        <Route path="/" element={<HomePage />} />  
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
      </div>
    </div>
  );
};

const RootApp = () => (
  <Router>
    <App />
  </Router>
);

export default RootApp;
