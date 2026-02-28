🛡️ Smart Complaint Management System

A role-based Complaint Management System built with React + Vite that streamlines the process of submitting, tracking, and resolving complaints within an educational or organizational environment.

This system enables students, staff, and administrators to interact through clearly defined workflows with a clean, responsive, and modern UI.

📌 Overview

The Smart Complaint Management System is designed to:

Provide a structured platform for submitting complaints

Enable transparent tracking of complaint status

Ensure role-based access and actions

Improve communication between users and administration

Offer a clean and intuitive dashboard experience

The frontend is built with modern React architecture and integrates with a mock backend for development and demonstration purposes.

👥 User Roles & Capabilities
🎓 Student

    Submit new complaints

    View submitted complaints

    Track complaint status (Pending / In Progress / Resolved )



👩‍💼 Staff

    View assigned complaints

    Update complaint status

    Add remarks

🛠️ Administrator

    View all complaints

    Assign complaints to staff

    manage students and staffs

    Monitor system activity

    view overall system performance

🏗️ System Architecture
Frontend

    Component-based architecture using React

    Role-based routing and UI rendering

    Clean dashboard layout with sidebar navigation

    Responsive design using Tailwind CSS

Backend (Mock for Development)

    JSON Server used as a mock REST API

    Simulates CRUD operations for:

    Users

    Complaints

    Status updates

🧰 Tech Stack
Technology	        Purpose
React    	        UI development
Vite	            Fast development & build tool
React Router	    Role-based navigation
Tailwind CSS v4	    Styling and layout
JSON Server	        Mock backend API
ESLint	            Code quality & linting

🚀 Getting Started

1️⃣ Clone the Repository

2️⃣ Install Dependencies

3️⃣ Start Development Server

🔐 Role-Based Flow

    The system uses role-aware rendering logic to:

    Restrict access to specific routes

    Dynamically adjust sidebar menu items

    Conditionally render dashboard content

    Control available actions per user role

    This ensures:

        Clear separation of responsibilities

        Secure interaction flow

        Scalable architecture for future backend integration

🎨 UI & Design Principles:

    Clean dashboard layout

    Structured sidebar navigation

    Consistent spacing using Tailwind utility classes

    Responsive across screen sizes

    Accessible component structure

    Reusable UI components for scalability

    📈 Future Improvements

        Replace JSON Server with a real backend (Node.js / Express / Spring Boot / etc.)

        Add authentication (JWT-based)

        Add email or notification system

        Add large file size  attachment support

        Introduce audit logs for administrative tracking

📚 Learning & Engineering Focus

    This project demonstrates:

        Clean component architecture

        Role-based UI logic

        State management patterns

        REST API integration

        Scalable folder structure

        Modern frontend best practices