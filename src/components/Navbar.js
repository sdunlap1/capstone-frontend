import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { token, logout } = useAuth();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close the menu when clicking anywhere outside of it
  const handleClickOutside = (event) => {
    if (menuOpen && !event.target.closest(".navbar")) {
      setMenuOpen(false);
    }
  };
   // Close the menu after clicking a link
   const handleLinkClick = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);
  
  return (
    <nav className="navbar">
      <div className="nav-header">
      <button className="hamburger" onClick={toggleMenu}>
          &#9776;
        </button>
      </div>
      <ul className={`nav-links ${menuOpen ? "show-menu" : ""}`}>
        {/* Show Dashboard and Calendar for logged-in users */}
        {token ? (
          <>
            <li onClick={handleLinkClick}>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li onClick={handleLinkClick}>
              <Link to="/calendar">Calendar</Link>
            </li>
            {/* <li onClick={handleLinkClick}>
              <Link to="/user">User Info</Link>
            </li> */}
            <li>
              <button onClick={logout}>Logout</button>
            </li>
          </>
        ) : (
          // Show only login and signup if user is not logged in
          <>
            {location.pathname !== "/login" && (
              <li onClick={handleLinkClick}>
                <Link to="/login">Login</Link>
              </li>
            )}
            {location.pathname !== "/signup" && (
              <li onClick={handleLinkClick}>
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
