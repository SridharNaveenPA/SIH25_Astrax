-- Database Update Script for Timetable Management System
-- Run this script in your PostgreSQL database to add the new tables

-- Users table for authentication (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100)
);

-- Rooms table (if not exists)
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(20) UNIQUE NOT NULL,
  building VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  room_type VARCHAR(30) NOT NULL CHECK (room_type IN ('Lecture Hall', 'Laboratory')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table (if not exists)
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  credits INTEGER NOT NULL,
  course_type VARCHAR(20) NOT NULL CHECK (course_type IN ('Theory', 'Lab', 'Lab Cum Theory')),
  min_lab_hours INTEGER DEFAULT 0 CHECK (min_lab_hours >= 0),
  min_theory_hours INTEGER DEFAULT 0 CHECK (min_theory_hours >= 0),
  max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
  prerequisites TEXT,
  instructor_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table (extended user information for staff)
CREATE TABLE IF NOT EXISTS faculty (
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
CREATE TABLE IF NOT EXISTS faculty_subjects (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(faculty_id, subject_id)
);

-- Credit limits table for each semester
CREATE TABLE IF NOT EXISTS credit_limits (
  id SERIAL PRIMARY KEY,
  semester_number INTEGER UNIQUE NOT NULL CHECK (semester_number >= 1 AND semester_number <= 8),
  max_credits INTEGER NOT NULL CHECK (max_credits > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prerequisites junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS subject_prerequisites (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  prerequisite_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(subject_id, prerequisite_id),
  CHECK (subject_id != prerequisite_id) -- Prevent self-reference
);

-- Student enrollments table
CREATE TABLE IF NOT EXISTS student_enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'completed')),
  UNIQUE(student_id, subject_id)
);

-- Timetables table
CREATE TABLE IF NOT EXISTS timetables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Timetable slots table (individual class sessions)
CREATE TABLE IF NOT EXISTS timetable_slots (
  id SERIAL PRIMARY KEY,
  timetable_id INTEGER REFERENCES timetables(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  instructor_id INTEGER REFERENCES users(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_type VARCHAR(20) DEFAULT 'theory' CHECK (slot_type IN ('theory', 'lab', 'tutorial')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student timetable view (for students to see their personalized schedule)
CREATE TABLE IF NOT EXISTS student_timetable_view (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  timetable_id INTEGER REFERENCES timetables(id) ON DELETE CASCADE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, timetable_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_subject_id ON student_enrollments(subject_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_timetable_id ON timetable_slots(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_subject_id ON timetable_slots(subject_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_day_time ON timetable_slots(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON faculty(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_subjects_faculty_id ON faculty_subjects(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_subjects_subject_id ON faculty_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_subjects_instructor_id ON subjects(instructor_id);

-- Insert initial credit limits for all semesters (if not already present)
INSERT INTO credit_limits (semester_number, max_credits) 
SELECT * FROM (VALUES 
  (1, 24), (2, 24), (3, 24), (4, 24), 
  (5, 24), (6, 24), (7, 24), (8, 24)
) AS v(semester_number, max_credits)
WHERE NOT EXISTS (
  SELECT 1 FROM credit_limits WHERE credit_limits.semester_number = v.semester_number
);

-- Insert default users as specified in README.md (if not already present)

-- Insert sample admin user
INSERT INTO users (username, password_hash, role, name, email) 
SELECT 'admin', 'admin', 'admin', 'System Administrator', 'admin@university.edu'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'admin'
);

-- Insert sample student user
INSERT INTO users (username, password_hash, role, name, email) 
SELECT 'student001', 'studentpass', 'student', 'John Student', 'john.student@university.edu'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'student001'
);

-- Insert sample staff user
INSERT INTO users (username, password_hash, role, name, email) 
SELECT 'staff001', 'staffpass', 'staff', 'Dr. Jane Smith', 'jane.smith@university.edu'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'staff001'
);

-- Insert sample data for testing (optional - uncomment if needed)
-- Sample timetable
-- INSERT INTO timetables (name, semester, academic_year, created_by, status) 
-- SELECT 'Fall 2024 Master Timetable', 'Fall', '2024-25', 1, 'published'
-- WHERE NOT EXISTS (SELECT 1 FROM timetables WHERE name = 'Fall 2024 Master Timetable');

-- Sample timetable slots (adjust subject_id, room_id, instructor_id based on your data)
-- INSERT INTO timetable_slots (timetable_id, subject_id, room_id, instructor_id, day_of_week, start_time, end_time, slot_type)
-- SELECT * FROM (VALUES 
--   (1, 1, 1, 2, 1, '09:00', '10:30', 'theory'),
--   (1, 2, 2, 3, 1, '11:00', '12:30', 'theory'),
--   (1, 1, 1, 2, 3, '09:00', '10:30', 'theory'),
--   (1, 2, 2, 3, 3, '11:00', '12:30', 'theory')
-- ) AS v(timetable_id, subject_id, room_id, instructor_id, day_of_week, start_time, end_time, slot_type)
-- WHERE NOT EXISTS (SELECT 1 FROM timetable_slots WHERE timetable_id = v.timetable_id AND subject_id = v.subject_id AND day_of_week = v.day_of_week AND start_time = v.start_time);

COMMIT;
