# Library Management System

A complete Library Management System built with Node.js, Express.js, MySQL, and EJS.

## Features
- **Role-Based Authentication**: Admin, Librarian, and Member roles.
- **JWT Authentication**: Secure login and session management using JWT and cookies.
- **Responsive UI**: Modern dashboard built with Bootstrap 5 and FontAwesome.
- **Book Management**: CRUD operations for books and categories.
- **Borrowing System**: Request borrow, approval flow, and book returns.
- **Fine Management**: Automatic fine calculation for overdue books.
- **Reports & Analytics**: Admin dashboard with system statistics and reports.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL (Aiven MySQL)
- **Frontend**: EJS Templates, Bootstrap 5
- **Authentication**: JWT, bcryptjs, cookie-parser

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Update the `.env` file with your MySQL credentials and secrets:
   ```env
   PORT=3000
   DB_HOST=your_host
   DB_PORT=your_port
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=your_db
   JWT_SECRET=your_secret
   SESSION_SECRET=your_session_secret
   ```

3. **Initialize Database**:
   Run the initialization script to create tables:
   ```bash
   node db_init.js
   ```

4. **Run the Server**:
   ```bash
   npm start
   ```

## Folder Structure
- `config/`: Database configuration
- `controllers/`: Request handlers
- `middleware/`: Auth and role-based access control
- `models/`: Database interactions (via controllers)
- `routes/`: Express routes
- `views/`: EJS templates (MVC)
- `public/`: Static assets (CSS/JS)
- `uploads/`: Book images/files (if any)
