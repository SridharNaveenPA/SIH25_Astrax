-- SQL Script to add faculty entries for existing staff users
-- Run this in pgAdmin to ensure your staff users have department information

-- Insert faculty records for existing staff users
INSERT INTO faculty (user_id, name, email, phone, department, max_hours_per_week, availability) 
SELECT 
  u.id,
  u.name,
  u.email,
  '+1234567890',  -- Default phone number
  'Computer Science',  -- Default department
  40,  -- Default max hours per week
  '{}'::jsonb  -- Default empty availability
FROM users u 
WHERE u.role = 'staff' 
  AND NOT EXISTS (SELECT 1 FROM faculty f WHERE f.user_id = u.id);

-- Verify the faculty records were created
SELECT u.id, u.username, u.name, u.email, f.department 
FROM users u 
LEFT JOIN faculty f ON u.id = f.user_id 
WHERE u.role = 'staff'
ORDER BY u.username;