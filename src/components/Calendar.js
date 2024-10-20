"use strict";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import AddProjectModal from "./AddProjectModal";
import EditProjectModal from "./EditProjectModal";
import "../styles/Calendar.css";

const Calendar = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false); // State for AddProjectModal
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // State for tracking current view and date
  const [currentView, setCurrentView] = useState(localStorage.getItem("calendarView") || "dayGridMonth");
  const [currentDate, setCurrentDate] = useState(localStorage.getItem("calendarDate") || new Date().toISOString());

  const calendarRef = useRef(null);

  // Fetch tasks from the backend and convert them to calendar events
  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get("/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tasks = response.data.tasks;

      if (Array.isArray(tasks)) {
        const taskEvents = tasks.map((task) => ({
          id: `task-${task.id}`,
          title: task.title,
          start: task.due_date,
          description: task.description || "",
          type: "task",
          allDay: false,
          backgroundColor: "blue",
          classNames: ["task-event"],
        }));
        setEvents((prevEvents) => [...prevEvents, ...taskEvents]); // Merge with existing events
      } else {
        console.error("Tasks is not an array or is undefined:", tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Fetch projects from the backend and convert them to calendar events
  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get("/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const projects = response.data.projects;
      console.log("Projects from backend:", projects);
      if (Array.isArray(projects)) {
        const projectEvents = projects.map((project) => ({
          id: `project-${project.project_id}`,
          title: project.name,
          start: project.start_date, // Use start_date for multi-day projects
          end: project.due_date || project.start_date, // Use due_date as the end date
          allDay: true, // Set to all-day for project spanning multiple dates
          backgroundColor: "#4CAF50",
          borderColor: "#FFD700",
          description: project.description || "",
          type: "project",
          project_id: project.project_id,
        }));
        setEvents((prevEvents) => [...prevEvents, ...projectEvents]); // Merge with existing events
      } else {
        console.error("Projects is not an array or is undefined:", projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Fetch both tasks and projects as calendar events
  const fetchEvents = async () => {
    setEvents([]); // Clear events before fetching new data
    await fetchTasks();
    await fetchProjects();
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

 // Save view and date when the view or date changes
const handleViewChange = (view) => {
  // Check if calendarRef is initialized and not null
  if (calendarRef.current) {
    const calendarApi = calendarRef.current.getApi();
    const activeDate = calendarApi.getDate(); // Get the active date (visible date)

    setCurrentView(view);
    setCurrentDate(activeDate.toISOString()); // Store the visible date

    localStorage.setItem("calendarView", view); // Save view type in localStorage
    localStorage.setItem("calendarDate", activeDate.toISOString()); // Save visible date in localStorage
  } else {
    console.error("Calendar reference is not yet available");
  }
};

  const handleTaskAdded = () => {
    fetchEvents(); // Refresh events after adding a task
  };

  const handleProjectAdded = () => {
    fetchEvents(); // Refresh events after adding a project
  };

  // Handle clicking on an event (task or project) to edit
  const handleEventClick = (clickInfo) => {
    const { id, title, extendedProps } = clickInfo.event;

    // Safely extract the start and end dates
    const start = clickInfo.event.start
      ? new Date(clickInfo.event.start)
      : null;
    const end = clickInfo.event.end ? new Date(clickInfo.event.end) : null;

    if (extendedProps.type === "task") {
      // Ensure dates are properly handled
      const formattedDueDate = start
        ? start.toLocaleDateString("en-US", { timeZone: "UTC" })
        : "";
      setSelectedEvent({
        id: id.replace("task-", ""), // Extract task ID
        title: title || "", // Pre-fill the task title
        due_date: formattedDueDate,
        ...extendedProps, // Include other props like description
      });
      setIsTaskModalOpen(true); // Open EditTaskModal
    } else if (extendedProps.type === "project") {
      // Ensure the dates are properly handled
      const formattedStartDate = start
        ? start.toLocaleDateString("en-US", { timeZone: "UTC" })
        : ""; // U.S. format MM/DD/YYYY
      const formattedEndDate = end
        ? end.toLocaleDateString("en-US", { timeZone: "UTC" })
        : ""; // U.S. format MM/DD/YYYY

      console.log("Formatted start date:", formattedStartDate);
      console.log("Formatted end date:", formattedEndDate);

      setSelectedEvent({
        project_id: id.replace("project-", ""), // Extract project ID
        title: title || "", // Pre-fill project name
        start: formattedStartDate, // Safe formatted start date
        end: formattedEndDate, // Safe formatted end date
        ...extendedProps, // Include other props like description, dates
      });

      setIsProjectModalOpen(true); // Open EditProjectModal
    }
  };
  const handleEventResize = async (resizeInfo) => {
    console.log("Event resized:", resizeInfo); // Add this log
    const { event } = resizeInfo;
  
    const updatedStart = event.start.toISOString();
    const updatedEnd = event.end ? event.end.toISOString() : null;
  
    console.log("Updated start:", updatedStart);
    console.log("Updated end:", updatedEnd);
  
    const projectId = event.extendedProps.project_id;
  
    try {
      await axiosInstance.put(`/projects/${projectId}`, {
        start_date: updatedStart,
        due_date: updatedEnd,
      });
      alert("Project dates updated successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  // Handle drag-and-drop for tasks and projects
  const handleEventDrop = async (eventDropInfo) => {
    const { id, title, extendedProps } = eventDropInfo.event;
    const newStartDate = eventDropInfo.event.start;
    const newEndDate = eventDropInfo.event.end;

    try {
      if (extendedProps.type === "task") {
        await axiosInstance.put(
          `/tasks/${id.replace("task-", "")}`,
          {
            title,
            due_date: newStartDate,
            description: extendedProps.description,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Task updated successfully!");
      } else if (extendedProps.type === "project") {
        await axiosInstance.put(
          `/projects/${id.replace("project-", "")}`,
          {
            name: title,
            start_date: newStartDate,
            due_date: newEndDate,
            description: extendedProps.description,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Project updated successfully!");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update the event. Please try again.");
      eventDropInfo.revert();
    }
  };

  // Render custom content for calendar events (tasks/projects)
  const renderEventContent = (eventInfo) => (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  );

  return (
    <div>
      <h1>Task and Project Calendar</h1>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={currentView}
        initialDate={currentDate}
        eventResizableFromStart={true}
        eventDurationEditable={true}
        eventStartEditable={true}
        eventResize={handleEventResize}
        headerToolbar={{
          left: "prev,next today addTaskButton addProjectButton",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,timeGridFourDay",
        }}
        customButtons={{
          addTaskButton: {
            text: "Add Task",
            click: () => {
              setSelectedEvent(null); // Ensure the add task modal opens with a clean slate
              setIsTaskModalOpen(true);
            },
          },
          addProjectButton: {
            text: "Add Project",
            click: () => {
              setSelectedEvent(null); // Ensure the add project modal opens with a clean slate
              setIsAddProjectModalOpen(true); // Open the add project modal
            },
          },
        }}
        views={{
          timeGridFourDay: {
            type: "timeGrid",
            duration: { days: 4 },
            buttonText: "4 day",
          },
        }}
        events={events}
        selectable={true}
        editable={true}
        timeZone="local"
        // Comment out the select prop to prevent modal from popping up on calendar space clicks
        // select={handleDateSelect}
        eventClick={handleEventClick} // Handle clicking on events to edit
        eventDrop={handleEventDrop} // Handle drag-and-drop of events
        eventContent={renderEventContent} // Customize event display in calendar
        dayMaxEvents={true} // Limit events per day
        datesSet={({ view }) => handleViewChange(view.type)} // Track view changes
      />
      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isTaskModalOpen && !selectedEvent}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskAdded={handleTaskAdded}
        selectedDate={selectedDate}
      />
      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isTaskModalOpen && selectedEvent?.type === "task"}
        event={selectedEvent}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedEvent(null);
        }}
        onTaskUpdated={fetchEvents}
      />
      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onProjectAdded={handleProjectAdded}
      />
      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isProjectModalOpen && selectedEvent?.type === "project"}
        event={selectedEvent}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedEvent(null);
        }}
        onProjectUpdated={fetchEvents}
      />
    </div>
  );
};

export default Calendar;
