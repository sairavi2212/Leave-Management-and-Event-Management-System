# Leave Management and Event Management System

This project is a comprehensive web application for Eklavya Foundation that manages leaves, events, projects, and users within the organization.

## Project Overview

The Leave Management and Event Management System is a full-stack web application built with:

- **Frontend**: React, TypeScript, TailwindCSS, and Shadcn/UI components
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas

## Key Features

### Leave Management
- Leave request submission and tracking
- Automatic approval for short leaves (≤2 days)
- Leave status tracking and history
- Leave balance monitoring
- Email notifications for leave requests and status updates

### Event Management
- Event creation with image uploads
- Event comments and replies
- Event filtering by location and project

### Project Management
- Project creation and tracking
- Project status updates
- Team member and manager assignment

### User Management
- User registration with email notifications
- Role-based access control (user, admin, superadmin)
- Password reset functionality
- User profile management

## Deployment

The application uses MongoDB Atlas for cloud database storage and requires environment variables for configuration.

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- Secure email notifications

## Running the Application

1. Start the backend server: `cd code/backend && npm start`
2. Start the frontend: `cd code/frontend && npm run dev`
3. Access the application at: http://localhost:5173

The system is designed to streamline administrative processes within the Eklavya Foundation, improving efficiency in leave management, event coordination, and project tracking.