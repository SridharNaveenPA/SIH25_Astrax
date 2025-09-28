-- Database Update Script for Timetable Management System
-- Run this script in your PostgreSQL database to add the new tables

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

-- Insert sample data for testing (optional)
-- You can uncomment these lines to add sample data

-- Sample timetable
-- INSERT INTO timetables (name, semester, academic_year, created_by, status) 
-- VALUES ('Fall 2024 Master Timetable', 'Fall', '2024-25', 1, 'published');

-- Sample timetable slots (adjust subject_id, room_id, instructor_id based on your data)
-- INSERT INTO timetable_slots (timetable_id, subject_id, room_id, instructor_id, day_of_week, start_time, end_time, slot_type)
-- VALUES 
--   (1, 1, 1, 2, 1, '09:00', '10:30', 'theory'),
--   (1, 2, 2, 3, 1, '11:00', '12:30', 'theory'),
--   (1, 1, 1, 2, 3, '09:00', '10:30', 'theory'),
--   (1, 2, 2, 3, 3, '11:00', '12:30', 'theory');

COMMIT;
