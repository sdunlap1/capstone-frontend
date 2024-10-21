import React from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { token, logout } = useAuth();
  const location = useLocation();
  return (
    <nav>
      <ul>
        {/* Show Dashboard and Calendar for logged-in users */}
        {token ? (
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/calendar">Calendar</Link>
            </li>
            <li>
              <Link to="/user">User Info</Link>
            </li>
            <li>
              <button onClick={logout}>Logout</button>
            </li>
          </>
        ) : (
          // Show only login and signup if user is not logged in
          <>
            {location.pathname !== "/login" && (
              <li>
                <Link to="/login">Login</Link>
              </li>
            )}
            {location.pathname !== "/signup" && (
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            )}
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
