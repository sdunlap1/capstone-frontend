import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import axiosInstance from "../api/axiosInstance";
import "../styles/App.css";

const defaultZipCode = "67050";

const Dashboard = () => {
  const { token } = useAuth();
  const { user, loading } = useAuth(); // Fetch user data from your custom hook
  const [outstandingTasks, setOutstandingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [outstandingProjects, setOutstandingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [zipCode, setZipCode] = useState(
    localStorage.getItem("zip_code") || ""
  );

  // Fetch tasks from the backend and separate them into outstanding and completed
  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get("/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tasks = response.data.tasks; // Assuming the tasks array is in response.data.tasks

      if (Array.isArray(tasks)) {
        // Separate tasks based on completion status
        const outstanding = tasks.filter((task) => !task.completed);
        const completed = tasks.filter((task) => task.completed);

        // Set state
        setOutstandingTasks(outstanding);
        setCompletedTasks(completed);
      } else {
        console.error("Tasks is not an array or is undefined:", tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Fetch projects from the backend and separate them into outstanding and completed
  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get("/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const projects = response.data.projects; // Assuming the projects array is in response.data.projects

      if (Array.isArray(projects)) {
        // Separate projects based on completion status
        const outstanding = projects.filter((project) => !project.completed);
        const completed = projects.filter((project) => project.completed);

        // Set state
        setOutstandingProjects(outstanding);
        setCompletedProjects(completed);
      } else {
        console.error("Projects is not an array or is undefined:", projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // UseEffect to fetch tasks, projects and zip code when the component mounts
  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchZipCode();
  }, [token]);

  // Fetch the user's zip code from the backend
  const fetchZipCode = async () => {
    try {
      const storedZip = localStorage.getItem("zip_code");
      if (storedZip) {
        fetchWeather(storedZip);
      } else {
        const response = await axiosInstance.get("/user");
        const zip = response.data.zip_code || defaultZipCode;
        setZipCode(zip); // Set the zip code in state
        localStorage.setItem("zip_code", zip); // Save zip code to localStorage for persistence
        fetchWeather(zip);
      }
    } catch (error) {
      console.error("Error fetching zip code:", error);
      await fetchWeather(defaultZipCode);
    }
  };

  // Update the user's zip code in the backend and localStorage
  const updateZipCode = async (zip) => {
    try {
      await axiosInstance.put("/user", { zip_code: zip });
      localStorage.setItem("zip_code", zip); // Save to localStorage
    } catch (error) {
      console.error("Error updating zip code:", error);
    }
  };

  // Fetch weather data for current zip code
  const fetchWeather = async (zip) => {
    const apiKey = "7802107913c1661a17d9525eec1dd69f"; // Add your API key here
    if (!zip) {
      console.error("Zip code is empty, cannot fetch weather data.");
      return;
    }
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${apiKey}&units=imperial`
      );
      setWeatherData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
        await fetchWeather(defaultZipCode); // Fallback to default only if not already using it
    }
  };
  // Submit the form to update the zip code
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!zipCode.trim()) {
      setErrorMessage("Please enter a valid zip code.");
      return;
    }
    setErrorMessage("");
    updateZipCode(zipCode); // Save the zip code to the backend and localStorage
    fetchWeather(zipCode); // Fetch weather for the updated zip code immediately
    setZipCode("");
  };
  // Clear the input field on page load or refresh
  useEffect(() => {
    setZipCode(""); // Clear the input field on page load or refresh
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user found.</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Add this wrapper for centering */}
      <div className="dashboard-container">
        {/* Your user info, tasks/projects, and weather sections */}
        <div className="left-column">
          <div className="current-user">
          <h3>User Info</h3>
          <p>
            <strong>First Name:</strong> {user?.first_name || "Don't be shy,"}
          </p>
          <p>
          <strong>Last Name:</strong> {user?.last_name || "Enter your name!"}
          </p>
          <p>
            <strong>Username:</strong> {user?.username || "Guest"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "Nothing to see"}
          </p>
          <Link to="/user">Edit Info</Link>
          </div>
          {weatherData ? (
            <div className="weather-widget">
              <h3>Weather in {weatherData.name}</h3>
              <p>
                <img
                  src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                  alt={weatherData.weather[0].description}
                />
              </p>
              <p>
                {Math.round(weatherData.main.temp)}°F
                <br />
                Wind: {weatherData.wind.speed} m/s
              </p>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Enter Zip Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)} // Update zip code state
                />
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                <button type="submit">Get Weather</button>
              </form>{" "}
            </div>
          ) : (
            <p>Loading weather data...</p>
          )}
        </div>

        <div className="middle-column">
          <h3>Outstanding Tasks & Projects</h3>
          {outstandingTasks.length === 0 && outstandingProjects.length === 0 ? (
            <p>No outstanding tasks or projects.</p>
          ) : (
            <>
              {outstandingTasks.map((task) => (
                <p key={task.task_id} className="outstanding">
                  {task.title}
                </p> // Apply outstanding class
              ))}
              {outstandingProjects.map((project) => (
                <p key={project.project_id} className="outstanding">
                  {project.name}
                </p> // Apply outstanding class
              ))}
            </>
          )}

          <h3>Completed Tasks & Projects</h3>
          {completedTasks.length === 0 && completedProjects.length === 0 ? (
            <p>No completed tasks or projects.</p>
          ) : (
            <>
              {completedTasks.map((task) => (
                <p key={task.task_id} className="completed">
                  {task.title}
                </p> // Apply completed class
              ))}
              {completedProjects.map((project) => (
                <p key={project.project_id} className="completed">
                  {project.name}
                </p> // Apply completed class
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
