# Capstone Project: Task Manager

## Live Link
[Your deployed link here]

## Description
- This project is a full-stack Task Manager application that helps users keep track of their tasks and projects. It allows users to create, edit, delete, and manage tasks and projects efficiently, with due dates, descriptions, and time tracking. The application provides user authentication and ensures that users can only view and edit their own tasks and projects.

## Features
- **User Authentication**: Secure login and signup functionality using JWT tokens.
- **Task Management**: Users can add, edit, and delete tasks with customizable due dates, descriptions, and time.
- **Project Management**: Users can manage projects, including adding/editing tasks within each project.
- **Alerts and Validations**: Alerts when due dates are in the past or project end dates are before start dates, but users are still able to save.
- **Weather Information**: Display the current weather forecast for the user's location on the dashboard.
- **Responsive Design**: Works smoothly across different device sizes.

## Technology Stack
- **Frontend**: React.js, Axios for API requests, FullCalendar for task/project scheduling, and a weather API for fetching live data.
- **Backend**: Node.js, Express.js for building the RESTful API, Sequelize ORM for database management, PostgreSQL for database, and JWT for authentication.
- **Testing**: Mocha, Chai for testing the backend API routes.
- **Deployment**: Deployed to [Heroku/Render - whichever you're using].

## How to Run the Project

### Backend
1. Install dependencies:  
   ```bash
   npm install
2. Set up your environment variables in a `.env` file:
  ```DB_NAME=your_db_name
     DB_USER=your_db_user
     DB_PASS=your_db_pass
     DB_HOST=localhost
     JWT_SECRET=your_jwt_secret
  ```   
    

  