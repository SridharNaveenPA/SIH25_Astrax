-- Insert sample admin user
INSERT INTO users (username, password_hash, role, name, email) VALUES 
('admin', '$2b$10$dummy_hash_admin', 'admin', 'Administrator', 'admin@example.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample staff users
INSERT INTO users (username, password_hash, role, name, email) VALUES 
('staff1', '$2b$10$dummy_hash_staff1', 'staff', 'Dr. John Smith', 'john.smith@example.com'),
('staff2', '$2b$10$dummy_hash_staff2', 'staff', 'Dr. Jane Doe', 'jane.doe@example.com'),
('staff3', '$2b$10$dummy_hash_staff3', 'staff', 'Prof. Mike Johnson', 'mike.johnson@example.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample faculty records
INSERT INTO faculty (user_id, name, email, phone, department, max_hours_per_week, availability) 
SELECT u.id, u.name, u.email, '+1234567890', 'Computer Science', 40, '{}'::jsonb
FROM users u 
WHERE u.role = 'staff' AND u.username IN ('staff1', 'staff2', 'staff3')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample student users
INSERT INTO users (username, password_hash, role, name, email) VALUES 
('student1', '$2b$10$dummy_hash_student1', 'student', 'Alice Brown', 'alice.brown@example.com'),
('student2', '$2b$10$dummy_hash_student2', 'student', 'Bob Wilson', 'bob.wilson@example.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (room_id, building, capacity, room_type) VALUES 
('Room-101', 'Main Building', 50, 'Lecture Hall'),
('Room-102', 'Main Building', 45, 'Lecture Hall'),
('Lab-A', 'Tech Building', 30, 'Laboratory'),
('Lab-B', 'Tech Building', 25, 'Laboratory')
ON CONFLICT (room_id) DO NOTHING;

-- Insert sample subjects with instructor assignments
INSERT INTO subjects (course_code, course_name, semester, credits, course_type, min_lab_hours, min_theory_hours, max_capacity, prerequisites, instructor_id) 
SELECT 
  'CS301', 
  'Data Structures', 
  'Semester 5', 
  3, 
  'Lab Cum Theory', 
  2, 
  3, 
  45, 
  '',
  u.id
FROM users u 
WHERE u.username = 'staff1'
ON CONFLICT (course_code) DO UPDATE SET 
  instructor_id = EXCLUDED.instructor_id;

INSERT INTO subjects (course_code, course_name, semester, credits, course_type, min_lab_hours, min_theory_hours, max_capacity, prerequisites, instructor_id) 
SELECT 
  'CS302', 
  'Database Systems', 
  'Semester 5', 
  3, 
  'Theory', 
  0, 
  4, 
  40, 
  'CS301',
  u.id
FROM users u 
WHERE u.username = 'staff1'
ON CONFLICT (course_code) DO UPDATE SET 
  instructor_id = EXCLUDED.instructor_id;

INSERT INTO subjects (course_code, course_name, semester, credits, course_type, min_lab_hours, min_theory_hours, max_capacity, prerequisites, instructor_id) 
SELECT 
  'CS401', 
  'Machine Learning', 
  'Semester 7', 
  4, 
  'Lab Cum Theory', 
  2, 
  4, 
  35, 
  'CS301, CS302',
  u.id
FROM users u 
WHERE u.username = 'staff2'
ON CONFLICT (course_code) DO UPDATE SET 
  instructor_id = EXCLUDED.instructor_id;

INSERT INTO subjects (course_code, course_name, semester, credits, course_type, min_lab_hours, min_theory_hours, max_capacity, prerequisites, instructor_id) 
SELECT 
  'CS303', 
  'Operating Systems', 
  'Semester 5', 
  3, 
  'Theory', 
  0, 
  4, 
  42, 
  'CS301',
  u.id
FROM users u 
WHERE u.username = 'staff3'
ON CONFLICT (course_code) DO UPDATE SET 
  instructor_id = EXCLUDED.instructor_id;

-- Insert some sample student enrollments
INSERT INTO student_enrollments (student_id, subject_id, status)
SELECT 
  u.id,
  s.id,
  'enrolled'
FROM users u, subjects s
WHERE u.role = 'student' AND s.course_code IN ('CS301', 'CS302')
ON CONFLICT (student_id, subject_id) DO NOTHING;