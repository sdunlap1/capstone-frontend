"use strict";

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import tippy from "tippy.js";
import "tippy.js/dist/backdrop.css";
import "tippy.js/animations/shift-away.css";
import "tippy.js/themes/light.css";
import "tippy.js/themes/light-border.css";
import "tippy.js/dist/border.css";
import "tippy.js/dist/tippy.css";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import AddProjectModal from "./AddProjectModal";
import EditProjectModal from "./EditProjectModal";

const Calendar = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false); // State for AddProjectModal
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const calendarRef = useRef(null);
  const searchRef = useRef(null); // Reference to the search container

  // State for tracking current view and date
  const [currentView, setCurrentView] = useState(
    localStorage.getItem("calendarView") || "dayGridMonth"
  );
  const [currentDate, setCurrentDate] = useState(
    localStorage.getItem("calendarDate") || new Date().toISOString()
  );

  // Fetch tasks from the backend and convert them to calendar events
  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get("/tasks", {
        params: {
          search: searchTerm, // Axios params is cleaner for search
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tasks = response.data.tasks;
      console.log("Tasks from the backend.", tasks);
      if (Array.isArray(tasks)) {
        const taskEvents = tasks.map((task) => ({
          id: `task-${task.task_id}`,
          title: task.title,
          start: new Date(`${task.due_date}Z`),
          description: task.description || "",
          completed: task.completed,
          type: "task",
          allDay: false,
          notified_past_due: task.notified_past_due,
          classNames: [task.completed ? "completed-task" : "open-task"],
        }));
        console.log("Task Events:", taskEvents);
        return taskEvents;
      } else {
        console.error("Tasks is not an array or is undefined:", tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  };

  // Fetch projects from the backend and convert them to calendar events
  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get("/projects", {
        params: {
          search: searchTerm, // Axios is params is cleaner
        },
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
          description: project.description || "",
          completed: project.completed,
          type: "project",
          project_id: project.project_id,
          notified_past_due: project.notified_past_due,
          classNames: [
            project.completed ? "completed-project" : "open-project",
          ],
        }));
        return projectEvents;
      } else {
        console.error("Projects is not an array or is undefined:", projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  };

  // Fetch both tasks and projects as calendar events
  const fetchEvents = async () => {
    setEvents([]); // Clear events before fetching new data
    // Clear events before fetching new ones
    const taskEvents = await fetchTasks();
    const projectEvents = await fetchProjects();

    // Set fresh events directly (without appending)
    setEvents([...taskEvents, ...projectEvents]);
  };

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token, searchTerm]);

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

    // Simulate an outside click to close the popover
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    // Safely extract the start and end dates
    const start = clickInfo.event.start
      ? new Date(clickInfo.event.start)
      : null;
    const end = clickInfo.event.end ? new Date(clickInfo.event.end) : null;

    if (extendedProps.type === "task") {
      // Ensure dates are properly handled
      setSelectedEvent({
        task_id: id.replace("task-", ""), // Extract task ID
        title: title || "", // Pre-fill the task title
        due_date: start?.toISOString() || "",
        completed: extendedProps.completed ?? false,
        ...extendedProps, // Include other props like description
      });
      setIsTaskModalOpen(true); // Open EditTaskModal
    } else if (extendedProps.type === "project") {
      // Ensure the dates are properly handled
      const formattedStartDate = start ? start.toLocaleDateString("en-US") : ""; // U.S. format MM/DD/YYYY
      const formattedEndDate = end ? end.toLocaleDateString("en-US") : ""; // U.S. format MM/DD/YYYY

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
    const { event } = resizeInfo;

    const updatedStart = event.start;
    const updatedEnd = event.end ? event.end : updatedStart;

    // Get today's date (set to midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison

    // Safeguard: Extract the original start and end dates
    const originalStartDate = new Date(event.extendedProps.start_date);
    originalStartDate.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison

    const originalEndDate = new Date(event.extendedProps.end_date);
    originalEndDate.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison

    // Check if the original end date was in the future
    // AND the new end date is in the past
    // BUT only show the alert if the end date is not already in the past
    if (
      !event.extendedProps.notified_past_due && // Only show alert if not already notified
      updatedEnd < today
    ) {
      alert("Warning: The new end date is in the past.");
      // Allow the resize, just show the warning once
    }
    const notifiedPastDue = updatedEnd < today;
    const projectId = event.extendedProps.project_id;

    try {
      await axiosInstance.put(`/projects/${projectId}`, {
        start_date: updatedStart,
        due_date: updatedEnd,
        notified_past_due: notifiedPastDue,
      });

      event.setExtendedProp("notified_past_due", notifiedPastDue);

      alert("Project dates updated successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
      return;
    }
  };

  // Handle drag-and-drop for tasks and projects
  const handleEventDrop = async (eventDropInfo) => {
    const { id, title, extendedProps } = eventDropInfo.event;
    const newStartDate = eventDropInfo.event.start;
    const newEndDate = eventDropInfo.event.end || newStartDate;

    // Convert Task due_date to UTC for backend
    const utcStartDate = newStartDate.toISOString();
    const utcEndDate = newEndDate.toISOString();

    // Get today's date (set to midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for accurate comparison

    const notifiedPastDue = new Date(utcEndDate) < today;

    // Log key variables for debugging
    console.log("=== Drag and Drop Debugging ===");
    console.log("Event ID:", id);
    console.log("Title:", title);
    console.log("New Start Date:", newStartDate);
    console.log("New End Date:", newEndDate);
    console.log("Today's Date (midnight):", today);
    console.log("Original Notified Past Due:", extendedProps.notified_past_due);
    console.log("Calculated Notified Past Due:", notifiedPastDue);

    // Check if the original start date was in the future, and the new start date is in the past
    if (!extendedProps.notified_past_due && notifiedPastDue) {
      alert("Warning: The end date is in the past.");
      // Allow the drop, but just show the warning
    }

    try {
      if (extendedProps.type === "task") {
        console.log("Updating Task...");
        await axiosInstance.put(
          `/tasks/${id.replace("task-", "")}`,
          {
            title,
            due_date: utcStartDate,
            description: extendedProps.description,
            notified_past_due: notifiedPastDue,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Task Updated Successfully");
        alert("Task updated successfully!");
      } else if (extendedProps.type === "project") {
        await axiosInstance.put(
          `/projects/${id.replace("project-", "")}`,
          {
            name: title,
            start_date: newStartDate,
            due_date: newEndDate,
            description: extendedProps.description,
            notified_past_due: notifiedPastDue,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Project updated successfully!");
      }
      eventDropInfo.event.setExtendedProp("notified_past_due", notifiedPastDue);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update the event. Please try again.");
      eventDropInfo.revert();
    }
  };

  // Handles when a user hovers over a task or project
  const handleEventMouseEnter = (info) => {
    const { title, extendedProps, start, end } = info.event;

    // Format start and end dates
    const startDate = new Date(start).toLocaleDateString("en-US");
    const endDate = end ? new Date(end).toLocaleDateString("en-US") : null;

    // Build the content for the tooltip
    const eventContent = `
    <strong>${title}</strong><br>
    Description: ${extendedProps.description || "No description"}<br>
    Start Date: ${startDate}<br>
    ${endDate ? `End Date: ${endDate}` : ""}`;

    const isTouchDevice = () =>
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    // Create the tooltip
    tippy(info.el, {
      content: eventContent,
      allowHTML: true,
      interactive: false, // Ensures tooltips won't "stick"
      hideOnClick: true, // Close tip when clicking outside
      trigger: isTouchDevice() ? "click touchstart" : "mouseenter", // Trigger on touch and click for mobile
      placement: "top",
      animation: "shift-away",
      theme: "light", // Optional: custom themes from tippy.js
      arrow: true,
      appendTo: document.body,
      duration: [900, 300], // Sets speed of opening and closing tip
    });
  };

  // Handles when a user leaves the task/project (optional cleanup)
  const handleEventMouseLeave = (info) => {
    // Optional if you want to handle specific cleanup after hover
  };

  // Render custom content for calendar events (tasks/projects)
  const renderEventContent = (eventInfo) => (
    <div className="cal-styling">
      <b>{eventInfo.timeText}</b>
      &nbsp;
      <i>{eventInfo.event.title}</i>
    </div>
  );
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchTerm(""); // Clear the search term when clicking outside
      }
    };

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  // Adding useEffect for clicking on day/date header to take you to day view.
  useEffect(() => {
    const handleGlobalClick = (event) => {
      const target = event.target;

      // Ensure target is a valid DOM element
      if (!(target instanceof Element)) {
        console.log("Invalid target:", target);
        return; // Exit if target is not an element
      }

      const calendarApi = calendarRef.current
        ? calendarRef.current.getApi()
        : null;

      // Check if the click is on a day header in week/4-day views
      const isWeekView = ["timeGridWeek", "timeGridFourDay"].includes(
        calendarApi?.view.type
      );
      const isDayHeaderClicked = target.closest(".fc-col-header-cell-cushion");

      // Only change view if in week/4-day view and clicking on day header
      if (isWeekView && isDayHeaderClicked) {
        const dayString = isDayHeaderClicked
          .closest("th")
          .getAttribute("data-date"); // Get the date
        calendarApi.changeView("timeGridDay", dayString);
      }

      // Additional click handling based on `target.closest`
      const eventTarget = event.target.closest(
        ".fc-event, .fc-event-main, .fc-timegrid-slot"
      );

      if (eventTarget) {
        if (eventTarget.classList.contains("fc-event")) {
          // Custom logic for event clicks can go here
        } else if (eventTarget.classList.contains("fc-timegrid-slot")) {
          // Custom logic for time grid slot clicks can go here
        }
      } else {
      }
    };

    // Attach event listener for clicks
    document.addEventListener("mousedown", handleGlobalClick);

    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener("mousedown", handleGlobalClick);
    };
  }, []);

  return (
    <div>
      {/* Search Bar */}
      <div className="search-container" ref={searchRef}>
        <input
          type="text"
          placeholder="Search tasks/projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Search Results */}
        <div className="search-results">
          {searchTerm.trim() !== "" &&
            events
              .filter(
                (event) =>
                  event.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  event.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) // Include description in search
              )
              .map((event) => (
                <div
                  key={event.id}
                  className="search-result-item"
                  onClick={() => {
                    const calendarApi = calendarRef.current.getApi();
                    if (event.type === "task") {
                      // Navigate to the day for tasks
                      calendarApi.changeView("timeGridDay", event.start);
                    } else if (event.type === "project") {
                      // Navigate to the start date of the project
                      calendarApi.changeView("timeGridDay", event.start);
                    }
                    setSearchTerm("");
                  }}
                >
                  {event.title} - {new Date(event.start).toLocaleDateString()}
                </div>
              ))}
        </div>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={currentView}
        initialDate={currentDate}
        selectable={false} // Stops task from being created on click
        selectMirror={true}
        eventResizableFromStart={true}
        eventDurationEditable={true}
        eventStartEditable={true}
        eventResize={handleEventResize}
        aspectRatio={1.35}
        handleWindowResize={true}
        headerToolbar={{
          left: "", // All buttons on the left
          center: "title", // The title (month, day, year) centered
          right:
            "prev,next today,dayGridMonth,timeGridWeek,timeGridDay,timeGridFourDay addTaskButton,addProjectButton", // View switchers on the right
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
          timeGridWeek: {
            dayHeaderContent: (args) => {
              const date = args.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const day = args.date.toLocaleDateString("en-US", {
                weekday: "short",
              });
              return (
                <div>
                  <div>{day}</div>
                  <div>{date}</div>
                </div>
              );
            },
          },
          timeGridFourDay: {
            type: "timeGrid",
            duration: { days: 4 },
            buttonText: "4 day",
            dayHeaderContent: (args) => {
              const date = args.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const day = args.date.toLocaleDateString("en-US", {
                weekday: "short",
              });
              return (
                <div>
                  <div>{day}</div>
                  <div>{date}</div>
                </div>
              );
            },
          },
          timeGridDay: {
            type: "timeGrid",
            buttonText: "Day",
            dayHeaderContent: (args) => {
              const date = args.date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              });
              const day = args.date.toLocaleDateString("en-US", {
                weekday: "long", // Use full weekday name for the day view
              });
              return (
                <div>
                  <div>{day}</div>
                  <div>{date}</div>
                </div>
              );
            },
          },
        }}
        events={events}
        editable={true}
        timeZone="local"
        // Comment out the select prop to prevent modal from popping up on calendar space clicks
        // select={handleDateSelect}
        eventClick={handleEventClick} // Handle clicking on events to edit
        eventDrop={handleEventDrop} // Handle drag-and-drop of events
        eventContent={renderEventContent} // Customize event display in calendar
        eventMouseEnter={handleEventMouseEnter} // Hover effect for tasks/projects
        eventMouseLeave={handleEventMouseLeave} // Remove tooltip on hover out
        dayMaxEvents={true} // Limit events per day
        datesSet={({ view }) => handleViewChange(view.type)} // Track view changes
        dateClick={(info) => {
          const calendarApi = calendarRef.current.getApi();
          const selectedDate = info.dateStr;
          const targetElement = info.jsEvent.target;

          // Check if we're in month, week, or 4-day view
          const isMonthView = calendarApi.view.type === "dayGridMonth";
          const isWeekView = ["timeGridWeek", "timeGridFourDay"].includes(
            calendarApi.view.type
          );

          // Month view: Only trigger if the user clicks on the day number
          const isDayNumberClicked = targetElement.classList.contains(
            "fc-daygrid-day-number"
          );

          // Week and 4-day views: Only trigger if the user clicks on the day header
          const isDayHeaderClicked = targetElement.closest(
            ".fc-col-header-cell-cushion"
          );

          // Navigate to day view based on the specific conditions for each view
          if (
            (isMonthView && isDayNumberClicked) ||
            (isWeekView && isDayHeaderClicked)
          ) {
            calendarApi.changeView("timeGridDay", selectedDate);
          }
        }}
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
