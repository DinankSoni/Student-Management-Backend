# Student Management Backend

This is the backend for the Student Management application, built with Node.js, Express, and MySQL. It provides APIs for managing student and admin functionalities, including registration, login, profile updates, and student management by admins. The backend is deployed on [Railway](https://railway.app).

## Features

- **Student Features**:
  - Register a new student (`POST /api/auth/register`).
  - Log in as a student (`POST /api/auth/login`).
  - View and update student profile, including name, email, password, and profile picture (`GET/POST /api/students/profile`).
  - Soft delete handling: Students cannot log in if marked as deleted (`isDeleted = true`).

- **Admin Features**:
  - Admin login (`POST /api/admin/login`).
  - View all students (`GET /api/admin/students`).
  - View a specific student by ID (`GET /api/admin/students/:id`).
  - Update a student’s profile as an admin (`POST /api/admin/students/:id`).
  - Soft delete a student (`POST /api/admin/students/:id/delete`).

- **Database Logging**:
  - A MySQL trigger (`after_student_register`) logs student registrations into the `student_logs` table with the student ID, action ("REGISTERED"), timestamp, and details (name and email).

- **Security**:
  - Passwords are hashed using `bcryptjs`.
  - JWT-based authentication for both students and admins.
  - Email uniqueness validation for student registration and profile updates.
  - Profile picture uploads to Cloudinary with cleanup of old images.

- **Database**:
  - Uses MySQL for persistent storage.
  - Tables: `students`, `admins`, `student_logs`.
  - Soft delete functionality with an `isDeleted` column in the `students` table.

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MySQL](https://www.mysql.com/) (for local database setup)
- A [Cloudinary](https://cloudinary.com/) account for profile picture uploads
- A Railway account (for deployment)

## Setup Instructions

Follow these steps to set up and run the backend locally.

### 1. Clone the Repository
Clone this repository to your local machine:

```bash
git clone https://github.com/your-username/student-management-backend.git
cd student-management-backend
```

### 2. Install Dependencies
Install the required Node.js packages:
```bash

npm install
```

### 3. Set Up Environment Variables
Create a .env file in the root of the backend folder and add the following environment variables:
```env

# Database Configuration
DATABASE_URL=mysql://root:your_password@localhost:3306/your_database_name

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret

# Cloudinary Configuration (for profile picture uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

 * Replace your_password, your_database_name, your_jwt_secret, your_cloud_name, your_api_key, and your_api_secret with your actual values.

 * For DATABASE_URL, use your local MySQL database credentials for local development. For Railway deployment, Railway provides its own DATABASE_URL.

### 4. Set Up the MySQL Database
 * Ensure MySQL is running on your local machine.

 * Create a database for the project:
```sql

CREATE DATABASE your_database_name;
```

* Update the DATABASE_URL in your .env file to match the database you created.

* The application uses a db.js file (in config/db.js) to connect to MySQL. Ensure the database connection works by running a test query or starting the server.

### 5. Create Database Tables
Manually create the required tables (students, admins, student_logs) in your MySQL database. Example SQL for table creation:
```sql

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE student_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    log_date DATETIME NOT NULL,
    details VARCHAR(255),
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

### 6. Create the Registration Trigger
Add the MySQL trigger to log student registrations into the student_logs table. Run the following SQL in your database:
```sql

USE your_database_name;

DELIMITER $$

CREATE TRIGGER after_student_register
AFTER INSERT ON students
FOR EACH ROW
BEGIN
    INSERT INTO student_logs (student_id, action, log_date, details)
    VALUES (NEW.id, 'REGISTERED', NOW(), CONCAT('Student: ', NEW.name, ', Email: ', NEW.email));
END$$

DELIMITER ;
```

 * Replace your_database_name with your actual database name (e.g., railway if deploying on Railway).
### 7. Seed Initial Data (Optional)
Insert an admin user for testing admin features:
```sql

INSERT INTO admins (username, password)
VALUES ('admin@yopmsil.com', '$2a$10$your_hashed_password');
```
 * Use bcryptjs to hash the password (admin) in your Node.js environment:
```javascript

const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('admin', 10));
```

* Replace $2a$10$your_hashed_password with the hashed password generated.

## API Endpoints
### Authentication
 * `POST /api/auth/register`: Register a new student.

 * `POST /api/auth/login`: Log in as a student.

 * `POST /api/admin/login`: Log in as an admin.

### Student Routes
 * `GET /api/students/profile`: Get the logged-in student’s profile.

 * `POST /api/students/profile`: Update the logged-in student’s profile (name, email, password, profile picture).

### Admin Routes
 * `GET /api/admin/students`: Get a list of all students.

 * `GET /api/admin/students/:id`: Get a specific student by ID.

 * `POST /api/admin/students/:id`: Update a student’s profile (admin only).

 * `POST /api/admin/students/:id/delete`: Soft delete a student (admin only).

## Technologies Used
 * Node.js: JavaScript runtime for the backend.

 * Express: Web framework for building APIs.

 * MySQL: Database for persistent storage.

 * Cloudinary: For uploading and managing profile pictures.

 * bcryptjs: For password hashing.

 * jsonwebtoken: For JWT-based authentication.

