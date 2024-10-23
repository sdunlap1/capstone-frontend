import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import CalendarPage from './pages/CalendarPage';
import UserPage from './pages/UserPage'; 
import Dashboard from './pages/Dashboard';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar'; 
import useAuth from './hooks/useAuth';
import './styles/App.css';
import './styles/Calendar.css';

const HomePage = () => (
  <div>
    <h1>Welcome to the Task Manager</h1>
    <p>Manage your tasks and projects effectively!</p>
  </div>
);

const App = () => {
  const { token } = useAuth();  // Use the auth hook to check if user is logged in

  return (
    <div className="App">
      <Navbar />
      <Routes>

        {/* If logged in, redirect from home to dashboard */}
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <div className="main-content"><HomePage /></div>} />

        {/* Dashboard route */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Calendar route with date parameter */}
        <Route path="/calendar/:date?" element={ 
          <ProtectedRoute>
            <div className="main-content">
              <CalendarPage />
            </div>
          </ProtectedRoute> 
        } />

        {/* User profile route */}
        <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />

        {/* Unprotected routes */}
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <div className="main-content"><LoginForm /></div>} />
        <Route path="/signup" element={token ? <Navigate to="/dashboard" /> : <div className="main-content"><SignupForm /></div>} />
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
