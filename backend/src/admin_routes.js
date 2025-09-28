const express = require('express');
const pool = require('./db');
const router = express.Router();

// Rooms CRUD operations
router.get('/rooms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY room_id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

router.post('/rooms', async (req, res) => {
  const { room_id, building, capacity, room_type } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO rooms (room_id, building, capacity, room_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [room_id, building, capacity, room_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating room:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Room ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create room' });
    }
  }
});

router.put('/rooms/:id', async (req, res) => {
  const { id } = req.params;
  const { room_id, building, capacity, room_type } = req.body;
  try {
    const result = await pool.query(
      'UPDATE rooms SET room_id = $1, building = $2, capacity = $3, room_type = $4 WHERE id = $5 RETURNING *',
      [room_id, building, capacity, room_type, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

router.delete('/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// Subjects CRUD operations
router.get('/subjects', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.name as instructor_name 
      FROM subjects s 
      LEFT JOIN users u ON s.instructor_id = u.id 
      ORDER BY s.course_code
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/subjects', async (req, res) => {
  const { course_code, course_name, semester, credits, course_type, min_lab_hours, min_theory_hours, max_capacity, prerequisites, instructor_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO subjects (course_code, course_name, semester, credits, course_type, min_lab_hours, min_theory_hours, max_capacity, prerequisites, instructor_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [course_code, course_name, semester, credits, course_type, min_lab_hours, min_theory_hours, max_capacity, prerequisites, instructor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating subject:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Course code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create subject' });
    }
  }
});

router.put('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const { course_code, course_name, semester, credits, course_type, min_lab_hours, min_theory_hours, max_capacity, prerequisites, instructor_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE subjects SET course_code = $1, course_name = $2, semester = $3, credits = $4, course_type = $5, min_lab_hours = $6, min_theory_hours = $7, max_capacity = $8, prerequisites = $9, instructor_id = $10 WHERE id = $11 RETURNING *',
      [course_code, course_name, semester, credits, course_type, min_lab_hours, min_theory_hours, max_capacity, prerequisites, instructor_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// Faculty CRUD operations
router.get('/faculty', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, u.username, u.email as user_email
      FROM faculty f 
      JOIN users u ON f.user_id = u.id 
      ORDER BY f.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
});

router.post('/faculty', async (req, res) => {
  const { username, password_hash, name, email, phone, department, max_hours_per_week, availability } = req.body;
  try {
    // First create user account
    const userResult = await pool.query(
      'INSERT INTO users (username, password_hash, role, name, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, password_hash, 'staff', name, email]
    );
    
    // Then create faculty record
    const facultyResult = await pool.query(
      'INSERT INTO faculty (user_id, name, email, phone, department, max_hours_per_week, availability) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userResult.rows[0].id, name, email, phone, department, max_hours_per_week, JSON.stringify(availability)]
    );
    
    res.status(201).json({ user: userResult.rows[0], faculty: facultyResult.rows[0] });
  } catch (error) {
    console.error('Error creating faculty:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create faculty' });
    }
  }
});

router.put('/faculty/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, department, max_hours_per_week, availability } = req.body;
  try {
    const result = await pool.query(
      'UPDATE faculty SET name = $1, email = $2, phone = $3, department = $4, max_hours_per_week = $5, availability = $6 WHERE id = $7 RETURNING *',
      [name, email, phone, department, max_hours_per_week, JSON.stringify(availability), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ error: 'Failed to update faculty' });
  }
});

router.delete('/faculty/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Get user_id first
    const facultyResult = await pool.query('SELECT user_id FROM faculty WHERE id = $1', [id]);
    if (facultyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    
    // Delete faculty record (this will cascade delete faculty_subjects)
    await pool.query('DELETE FROM faculty WHERE id = $1', [id]);
    
    // Delete user account
    await pool.query('DELETE FROM users WHERE id = $1', [facultyResult.rows[0].user_id]);
    
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
});

// Get available instructors (staff users)
router.get('/instructors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, f.department 
      FROM users u 
      JOIN faculty f ON u.id = f.user_id 
      WHERE u.role = 'staff'
      ORDER BY u.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
});

// Credit Limits CRUD operations
router.get('/credit-limits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM credit_limits ORDER BY semester_number');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching credit limits:', error);
    res.status(500).json({ error: 'Failed to fetch credit limits' });
  }
});

router.put('/credit-limits/:semester_number', async (req, res) => {
  const { semester_number } = req.params;
  const { max_credits } = req.body;
  try {
    const result = await pool.query(
      'UPDATE credit_limits SET max_credits = $1 WHERE semester_number = $2 RETURNING *',
      [max_credits, semester_number]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credit limit not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating credit limit:', error);
    res.status(500).json({ error: 'Failed to update credit limit' });
  }
});

// Get all courses for prerequisites dropdown
router.get('/courses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, course_code, course_name 
      FROM subjects 
      ORDER BY course_code
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get admin dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get total subjects count
    const subjectsResult = await pool.query('SELECT COUNT(*) as count FROM subjects');
    
    // Get faculty members count
    const facultyResult = await pool.query('SELECT COUNT(*) as count FROM faculty');
    
    // Get rooms available count
    const roomsResult = await pool.query('SELECT COUNT(*) as count FROM rooms');
    
    // Get timetables generated count
    const timetablesResult = await pool.query('SELECT COUNT(*) as count FROM timetables');
    
    res.json({
      totalSubjects: parseInt(subjectsResult.rows[0].count),
      facultyMembers: parseInt(facultyResult.rows[0].count),
      roomsAvailable: parseInt(roomsResult.rows[0].count),
      timetablesGenerated: parseInt(timetablesResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Timetables CRUD operations
router.get('/timetables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name as created_by_name
      FROM timetables t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ error: 'Failed to fetch timetables' });
  }
});

router.post('/timetables', async (req, res) => {
  const { name, semester, academic_year, created_by } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO timetables (name, semester, academic_year, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, semester, academic_year, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({ error: 'Failed to create timetable' });
  }
});

router.put('/timetables/:id', async (req, res) => {
  const { id } = req.params;
  const { name, semester, academic_year, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE timetables SET name = $1, semester = $2, academic_year = $3, status = $4 WHERE id = $5 RETURNING *',
      [name, semester, academic_year, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({ error: 'Failed to update timetable' });
  }
});

router.delete('/timetables/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM timetables WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ error: 'Failed to delete timetable' });
  }
});

module.exports = router;
