import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import axiosInstance from "../api/axiosInstance";
import "../styles/App.css";

const Dashboard = () => {
  const { token } = useAuth();
  const { user, loading } = useAuth(); // Fetch user data from your custom hook
  const [outstandingTasks, setOutstandingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [outstandingProjects, setOutstandingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

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

  // UseEffect to fetch tasks and projects when the component mounts
  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [token]);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = "7802107913c1661a17d9525eec1dd69f"; // Add your API key here
      const city = "Los Angeles"; // You can change this to user's location
      try {
        const response = await axiosInstance.get(
          `http://10.0.4.23:3003/https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        setWeatherData(response.data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user found.</div>;
  }

  return (
    <div className="dashboard-wrapper">
      {" "}
      {/* Add this wrapper for centering */}
      <div className="dashboard-container">
        {/* Your user info, tasks/projects, and weather sections */}
        <div className="left-column">
          <h3>User Info</h3>
          <p>
            <strong>Username:</strong> JohnDoe
          </p>
          <p>
            <strong>Email:</strong> johndoe@email.com
          </p>
          <a href="/user/edit">Edit Info</a>
          {/* Weather Info */}
          {weatherData ? (
            <div className="weather-widget">
              <h3>Weather in {weatherData.name}</h3>
              <p>{weatherData.weather[0].description}</p>
              <p>Temperature: {weatherData.main.temp}°C</p>
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>Wind: {weatherData.wind.speed} m/s</p>
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
                <p key={task.id} className="outstanding">
                  {task.title}
                </p> // Apply outstanding class
              ))}
              {outstandingProjects.map((project) => (
                <p key={project.id} className="outstanding">
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
                <p key={task.id} className="completed">
                  {task.title}
                </p> // Apply completed class
              ))}
              {completedProjects.map((project) => (
                <p key={project.id} className="completed">
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
