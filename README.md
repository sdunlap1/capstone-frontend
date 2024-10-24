# Capstone Project: Task Manager

## Live Link
[https://capstone-frontend-y6ub.onrender.com/]

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
2. Set up your environment variables in a .env file:
   ```
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASS=your_db_pass
   DB_HOST=localhost
   JWT_SECRET=your_jwt_secret
   ```

3. Run the database migrations and seed data:
  ```bash
      sequelize db:migrate
      sequelize db:seed:all
  ```
4. Start the server:
   ```bash
    npm start
   ```

- The server will run on [http://localhost:3001]

### Frontend
1. Navigate to the frontend directory:
    ```bash
    cd frontend
2. Install dependencies:
    ```bash
    npm install
3. Start the frontend:
    ```bash
    npm start
    ```

  - The frontend will run on [http://localhost:3000]

### Running tests:
  - Backend tests:
  ```bash
  npm test
 ```

### Standard User Flow
1. **Sign Up/Login:** Users first create an account or log in with existing credentials.
2. **Dashboard:** Once logged in, users are greeted with a dashboard displaying their current tasks and projects, along with a weather forecast.
3. **Managing Tasks and Projects:** From the dashboard, users can view, add, edit, or delete tasks and projects.
4. **Task/Project Alerts:** The app provides real-time validation, alerting users when they attempt to set unrealistic due dates.

### API Documentation
- **Authentication Routes:**
     - POST /login: Log in a user and return a JWT.
     - POST /signup: Create a new user account.
- **Task Routes:**
     - GET /tasks: Get all tasks for the logged-in user.
     - POST /tasks: Create a new task.
     - PUT /tasks/:id: Edit an existing task.
     - DELETE /tasks/:id: Delete a task.
- **Project Routes:**
     - GET /projects: Get all projects for the logged-in user.
     - POST /projects: Create a new project.
     - PUT /projects/:id: Edit an existing project.
     - DELETE /projects/:id: Delete a project.

### Additional Notes
  - The application supports local timezones, ensuring all due dates and times are correctly displayed for the user.
  - The task/project due date alerts allow users to save even if the due date is in the past.


    
  
