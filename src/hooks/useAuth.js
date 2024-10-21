import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const useAuth = () => {
  console.log("useAuth hook invoked");
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    // Check for the token, but don't redirect from the home or public pages
    const publicRoutes = ["/", "/login", "/signup"]; // List of public routes where no auth is required
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (!storedToken && !isPublicRoute) {
      console.log("No token found. Redirecting to login.");
      navigate("/login"); // Redirect to login only if the route is not public
    } else if (storedToken) {
      console.log("Token found:", storedToken);
      setToken(storedToken);
    }
  }, [navigate, location]);

  // Logout functionality to clear token
  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token"); // Remove token from localStorage
    setToken(null); // Clear token state
    navigate("/"); // Redirect to home page after logging out
  };

  return { token, logout };
};

export default useAuth;
