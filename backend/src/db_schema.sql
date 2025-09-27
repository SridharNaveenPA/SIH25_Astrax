-- Users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100)
);

-- Rooms table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(20) UNIQUE NOT NULL,
  building VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  room_type VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  credits INTEGER NOT NULL,
  prerequisites TEXT,
  instructor_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table (extended user information for staff)
CREATE TABLE faculty (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  department VARCHAR(50),
  max_hours_per_week INTEGER DEFAULT 40,
  availability JSONB, -- Store availability as JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty subjects junction table (courses they can teach)
CREATE TABLE faculty_subjects (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(faculty_id, subject_id)
);

-- Database connection string
-- Replace <username>, <password>, and timetable_db with your actual database credentials
DATABASE_URL=postgres://<username>:<password>@localhost:5432/timetable_db

-- JWT secret for signing tokens
-- Replace 'your_jwt_secret' with an actual secret key
JWT_SECRET=your_jwt_secret
