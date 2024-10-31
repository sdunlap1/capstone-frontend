import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import checkTokenExpiration from "../components/checkTokenExpiration";

const useAuth = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const expiration = checkTokenExpiration();

    // If token is expired remove and update state
    if (!expiration) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }

    const storedToken = localStorage.getItem("token");

    // Check for the token, but don't redirect from the home or public pages
    const publicRoutes = ["/", "/login", "/signup"]; // List of public routes where no auth is required
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (!storedToken && !isPublicRoute) {
      navigate("/"); // Redirect to login only if the route is not public
    } else if (storedToken) {
      setToken(storedToken);

      // Fetch user info after the token is set
      const fetchUserInfo = async () => {
        try {
          const response = await axiosInstance.get("/user", {
            headers: {
              Authorization: `Bearer ${storedToken}`, // Pass the token in the headers
            },
          });
          setUser(response.data); // Set the user info (username and email)
        } catch (error) {
          console.error("Error fetching user info:", error);
          localStorage.removeItem('tokem');
          navigate("/"); // Redirect to login on error
        } finally {
          setLoading(false); // Mark loading as complete
        }
      };

      fetchUserInfo(); // Trigger the fetch after setting the token
    } else {
      setLoading(false); // Set loading to false if no token and on public routes
    }
  }, [navigate, location]);

  // Logout functionality to clear token
  const logout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    setToken(null); // Clear token state
    setUser(null);
    // navigate("/"); // Redirect to home page after logging out
    window.location.href = "/"; // Instead of using navigate, this forces a clean reload
  };

  return { token, user, loading, logout };
};

export default useAuth;
