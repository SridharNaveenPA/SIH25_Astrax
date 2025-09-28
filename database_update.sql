-- Database Clean Initialization Script for Timetable Management System
-- This script will drop existing tables and recreate them with fresh data
-- Run this script in your PostgreSQL database for a clean setup

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS student_timetable_view CASCADE;
DROP TABLE IF EXISTS timetable_slots CASCADE;
DROP TABLE IF EXISTS timetables CASCADE;
DROP TABLE IF EXISTS student_enrollments CASCADE;
DROP TABLE IF EXISTS subject_prerequisites CASCADE;
DROP TABLE IF EXISTS faculty_subjects CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS credit_limits CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create fresh schema
BEGIN;

-- Users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
  name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(20) UNIQUE NOT NULL,
  building VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  room_type VARCHAR(30) NOT NULL CHECK (room_type IN ('Lecture Hall', 'Laboratory')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  course_type VARCHAR(20) NOT NULL CHECK (course_type IN ('Theory', 'Lab', 'Lab Cum Theory')),
  min_lab_hours INTEGER DEFAULT 0 CHECK (min_lab_hours >= 0),
  min_theory_hours INTEGER DEFAULT 0 CHECK (min_theory_hours >= 0),
  max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
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
  specialization VARCHAR(100),
  max_hours_per_week INTEGER DEFAULT 40 CHECK (max_hours_per_week > 0),
  availability JSONB DEFAULT '{}', -- Store availability as JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty subjects junction table (courses they can teach)
CREATE TABLE faculty_subjects (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(faculty_id, subject_id)
);

-- Credit limits table for each semester
CREATE TABLE credit_limits (
  id SERIAL PRIMARY KEY,
  semester_number INTEGER UNIQUE NOT NULL CHECK (semester_number >= 1 AND semester_number <= 8),
  max_credits INTEGER NOT NULL CHECK (max_credits > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prerequisites junction table (many-to-many relationship)
CREATE TABLE subject_prerequisites (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  prerequisite_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subject_id, prerequisite_id),
  CHECK (subject_id != prerequisite_id) -- Prevent self-reference
);

-- Student enrollments table
CREATE TABLE student_enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'completed')),
  UNIQUE(student_id, subject_id)
);

-- Timetables table
CREATE TABLE timetables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Timetable slots table (individual class sessions)
CREATE TABLE timetable_slots (
  id SERIAL PRIMARY KEY,
  timetable_id INTEGER REFERENCES timetables(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  instructor_id INTEGER REFERENCES users(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7), -- 1=Monday, 7=Sunday
  time_slot INTEGER NOT NULL CHECK (time_slot >= 0 AND time_slot <= 7), -- 0-7 for 8 periods
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_type VARCHAR(20) DEFAULT 'theory' CHECK (slot_type IN ('theory', 'lab', 'tutorial')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student timetable view (for students to see their personalized schedule)
CREATE TABLE student_timetable_view (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  timetable_id INTEGER REFERENCES timetables(id) ON DELETE CASCADE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, timetable_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_subjects_instructor_id ON subjects(instructor_id);
CREATE INDEX idx_subjects_course_code ON subjects(course_code);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_faculty_subjects_faculty_id ON faculty_subjects(faculty_id);
CREATE INDEX idx_faculty_subjects_subject_id ON faculty_subjects(subject_id);
CREATE INDEX idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX idx_student_enrollments_subject_id ON student_enrollments(subject_id);
CREATE INDEX idx_timetable_slots_timetable_id ON timetable_slots(timetable_id);
CREATE INDEX idx_timetable_slots_subject_id ON timetable_slots(subject_id);
CREATE INDEX idx_timetable_slots_room_id ON timetable_slots(room_id);
CREATE INDEX idx_timetable_slots_instructor_id ON timetable_slots(instructor_id);
CREATE INDEX idx_timetable_slots_day_time ON timetable_slots(day_of_week, time_slot);

-- Insert initial credit limits for all semesters
INSERT INTO credit_limits (semester_number, max_credits) VALUES 
(1, 24), (2, 24), (3, 24), (4, 24), 
(5, 24), (6, 24), (7, 24), (8, 24);

-- Insert comprehensive sample data

-- 1. Insert users (admin, staff, students)
INSERT INTO users (username, password_hash, role, name, email) VALUES 
-- Admin user
('admin', 'admin123', 'admin', 'System Administrator', 'admin@university.edu'),

-- Staff users (10 faculty members)
('staff_dr_a', 'staff123', 'staff', 'Dr. Alice Johnson', 'alice.johnson@university.edu'),
('staff_dr_b', 'staff123', 'staff', 'Dr. Bob Smith', 'bob.smith@university.edu'),
('staff_dr_c', 'staff123', 'staff', 'Dr. Carol Williams', 'carol.williams@university.edu'),
('staff_dr_d', 'staff123', 'staff', 'Dr. David Brown', 'david.brown@university.edu'),
('staff_dr_e', 'staff123', 'staff', 'Dr. Emily Davis', 'emily.davis@university.edu'),
('staff_dr_f', 'staff123', 'staff', 'Dr. Frank Wilson', 'frank.wilson@university.edu'),
('staff_dr_g', 'staff123', 'staff', 'Dr. Grace Miller', 'grace.miller@university.edu'),
('staff_dr_h', 'staff123', 'staff', 'Dr. Henry Taylor', 'henry.taylor@university.edu'),
('staff_dr_i', 'staff123', 'staff', 'Dr. Irene Anderson', 'irene.anderson@university.edu'),
('staff_dr_j', 'staff123', 'staff', 'Dr. James Thomas', 'james.thomas@university.edu'),

-- Student users (5 students)
('student_alice', 'student123', 'student', 'Alice Parker', 'alice.parker@student.edu'),
('student_bob', 'student123', 'student', 'Bob Rodriguez', 'bob.rodriguez@student.edu'),
('student_charlie', 'student123', 'student', 'Charlie Lewis', 'charlie.lewis@student.edu'),
('student_diana', 'student123', 'student', 'Diana Clark', 'diana.clark@student.edu'),
('student_eve', 'student123', 'student', 'Eve Martinez', 'eve.martinez@student.edu');

-- 2. Insert rooms (7 rooms with different capacities and types)
INSERT INTO rooms (room_id, building, capacity, room_type) VALUES 
('R1', 'Main Building', 60, 'Lecture Hall'),
('R2', 'Main Building', 50, 'Lecture Hall'),
('R3', 'Tech Building', 45, 'Lecture Hall'),
('Lab-A', 'Tech Building', 30, 'Laboratory'),
('Lab-B', 'Tech Building', 25, 'Laboratory'),
('Room-101', 'Science Building', 40, 'Lecture Hall'),
('Room-102', 'Science Building', 35, 'Lecture Hall');

-- 3. Insert faculty profiles
INSERT INTO faculty (user_id, name, email, phone, department, specialization, max_hours_per_week)
SELECT 
    u.id, u.name, u.email, 
    CASE 
        WHEN u.username = 'staff_dr_a' THEN '+1-555-0101'
        WHEN u.username = 'staff_dr_b' THEN '+1-555-0102'
        WHEN u.username = 'staff_dr_c' THEN '+1-555-0103'
        WHEN u.username = 'staff_dr_d' THEN '+1-555-0104'
        WHEN u.username = 'staff_dr_e' THEN '+1-555-0105'
        WHEN u.username = 'staff_dr_f' THEN '+1-555-0106'
        WHEN u.username = 'staff_dr_g' THEN '+1-555-0107'
        WHEN u.username = 'staff_dr_h' THEN '+1-555-0108'
        WHEN u.username = 'staff_dr_i' THEN '+1-555-0109'
        WHEN u.username = 'staff_dr_j' THEN '+1-555-0110'
    END as phone,
    CASE 
        WHEN u.username IN ('staff_dr_a', 'staff_dr_b', 'staff_dr_c') THEN 'Computer Science'
        WHEN u.username IN ('staff_dr_d', 'staff_dr_e') THEN 'Mathematics'
        WHEN u.username IN ('staff_dr_f', 'staff_dr_g') THEN 'Psychology'
        WHEN u.username IN ('staff_dr_h', 'staff_dr_i') THEN 'Engineering'
        WHEN u.username = 'staff_dr_j' THEN 'Physics'
    END as department,
    CASE 
        WHEN u.username = 'staff_dr_a' THEN 'Artificial Intelligence'
        WHEN u.username = 'staff_dr_b' THEN 'Machine Learning'
        WHEN u.username = 'staff_dr_c' THEN 'Database Systems'
        WHEN u.username = 'staff_dr_d' THEN 'Applied Mathematics'
        WHEN u.username = 'staff_dr_e' THEN 'Statistics'
        WHEN u.username = 'staff_dr_f' THEN 'Cognitive Psychology'
        WHEN u.username = 'staff_dr_g' THEN 'Educational Psychology'
        WHEN u.username = 'staff_dr_h' THEN 'Operating Systems'
        WHEN u.username = 'staff_dr_i' THEN 'Computer Networks'
        WHEN u.username = 'staff_dr_j' THEN 'Quantum Physics'
    END as specialization,
    40
FROM users u 
WHERE u.role = 'staff';

-- 4. Insert subjects (10 subjects based on the Python prototype)
INSERT INTO subjects (course_code, course_name, semester, credits, course_type, min_lab_hours, min_theory_hours, max_capacity, instructor_id)
SELECT 
    course_data.code,
    course_data.name,
    'Semester 5',
    course_data.credits,
    course_data.type,
    course_data.lab_hours,
    course_data.theory_hours,
    course_data.capacity,
    u.id
FROM (VALUES 
    ('AI101', 'Artificial Intelligence', 4, 'Lab Cum Theory', 2, 3, 50, 'staff_dr_a'),
    ('ML201', 'Machine Learning', 4, 'Lab Cum Theory', 2, 3, 45, 'staff_dr_b'),
    ('MATH301', 'Advanced Mathematics', 3, 'Theory', 0, 4, 60, 'staff_dr_d'),
    ('PSYC201', 'Psychology Fundamentals', 3, 'Theory', 0, 3, 55, 'staff_dr_f'),
    ('ITEP101', 'IT in Education and Psychology', 3, 'Lab Cum Theory', 1, 2, 40, 'staff_dr_g'),
    ('DBMS301', 'Database Management Systems', 4, 'Lab Cum Theory', 2, 3, 45, 'staff_dr_c'),
    ('OS301', 'Operating Systems', 4, 'Lab Cum Theory', 2, 3, 50, 'staff_dr_h'),
    ('NET401', 'Computer Networks', 3, 'Lab Cum Theory', 1, 3, 40, 'staff_dr_i'),
    ('ENG101', 'English Communication', 2, 'Theory', 0, 2, 60, 'staff_dr_e'),
    ('PHY201', 'Physics Applications', 3, 'Lab Cum Theory', 1, 2, 35, 'staff_dr_j')
) AS course_data(code, name, credits, type, lab_hours, theory_hours, capacity, instructor_username)
JOIN users u ON u.username = course_data.instructor_username;

-- 5. Insert faculty-subject relationships
INSERT INTO faculty_subjects (faculty_id, subject_id)
SELECT f.id, s.id
FROM faculty f
JOIN users u ON f.user_id = u.id
JOIN subjects s ON s.instructor_id = u.id;

-- 6. Insert student enrollments (each student enrolls in 4-5 subjects)
INSERT INTO student_enrollments (student_id, subject_id, status)
SELECT DISTINCT
    student_users.id,
    subjects.id,
    'enrolled'
FROM 
    (SELECT id, row_number() OVER (ORDER BY username) as student_num FROM users WHERE role = 'student') student_users
CROSS JOIN 
    (SELECT id, row_number() OVER (ORDER BY course_code) as subject_num FROM subjects) subjects
WHERE 
    -- Each student gets different combinations of subjects
    (student_users.student_num = 1 AND subjects.subject_num IN (1,2,3,4,5)) OR  -- Alice: AI, ML, Math, Psyc, ITEP
    (student_users.student_num = 2 AND subjects.subject_num IN (1,3,6,7,8)) OR  -- Bob: AI, Math, DBMS, OS, NET
    (student_users.student_num = 3 AND subjects.subject_num IN (2,4,6,9,10)) OR -- Charlie: ML, Psyc, DBMS, Eng, Phy
    (student_users.student_num = 4 AND subjects.subject_num IN (1,5,7,8,9)) OR  -- Diana: AI, ITEP, OS, NET, Eng
    (student_users.student_num = 5 AND subjects.subject_num IN (2,3,4,8,10));   -- Eve: ML, Math, Psyc, NET, Phy

-- 7. Create a default master timetable
INSERT INTO timetables (name, semester, academic_year, created_by, status)
SELECT 
    'Fall 2025 Master Timetable', 
    'Fall', 
    '2025-26', 
    u.id, 
    'published'
FROM users u 
WHERE u.username = 'admin';

COMMIT;

-- Display completion message
SELECT 'Database clean initialization completed successfully!' as status;
