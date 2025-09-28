const express = require('express');
const pool = require('./db');
const router = express.Router();

// Middleware to verify staff authentication
const verifyStaff = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'staff') {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get staff dashboard statistics
router.get('/dashboard-stats', verifyStaff, async (req, res) => {
  try {
    const staffId = req.user.id;
    
    // Get assigned subjects count
    const subjectsResult = await pool.query(
      'SELECT COUNT(*) as count FROM subjects WHERE instructor_id = $1',
      [staffId]
    );
    
    // Get total classes per week (dummy calculation for now)
    const classesResult = await pool.query(`
      SELECT COALESCE(SUM(s.min_lab_hours + s.min_theory_hours), 0) as total_hours
      FROM subjects s
      WHERE s.instructor_id = $1
    `, [staffId]);
    
    // Get total students (sum of max capacity of assigned subjects)
    const studentsResult = await pool.query(`
      SELECT COALESCE(SUM(s.max_capacity), 0) as total_students
      FROM subjects s
      WHERE s.instructor_id = $1
    `, [staffId]);
    
    res.json({
      subjectsAssigned: parseInt(subjectsResult.rows[0].count),
      classesPerWeek: parseInt(classesResult.rows[0].total_hours) || 0,
      totalStudents: parseInt(studentsResult.rows[0].total_students) || 0
    });
  } catch (error) {
    console.error('Error fetching staff dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get subjects assigned to the staff member
router.get('/my-subjects', verifyStaff, async (req, res) => {
  try {
    const staffId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        s.id,
        s.course_code,
        s.course_name,
        s.semester,
        s.credits,
        s.course_type,
        s.min_lab_hours,
        s.min_theory_hours,
        s.max_capacity,
        COUNT(se.id) as enrolled_students,
        CASE 
          WHEN s.course_type = 'Lab' THEN 'Lab-A'
          WHEN s.course_type = 'Theory' THEN 'Room-' || (100 + s.id)::text
          ELSE 'Lab-' || CHR(65 + (s.id % 26))
        END as room
      FROM subjects s
      LEFT JOIN student_enrollments se ON s.id = se.subject_id AND se.status = 'enrolled'
      WHERE s.instructor_id = $1
      GROUP BY s.id, s.course_code, s.course_name, s.semester, s.credits, s.course_type, s.min_lab_hours, s.min_theory_hours, s.max_capacity
      ORDER BY s.course_code
    `, [staffId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching staff subjects:', error);
    res.status(500).json({ error: 'Failed to fetch assigned subjects' });
  }
});

// Get staff schedule/timetable
router.get('/schedule', verifyStaff, async (req, res) => {
  try {
    const staffId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        ts.slot_type,
        s.course_code,
        s.course_name,
        r.room_id,
        r.building
      FROM timetable_slots ts
      JOIN subjects s ON ts.subject_id = s.id
      JOIN rooms r ON ts.room_id = r.id
      WHERE ts.instructor_id = $1
        AND ts.timetable_id IN (
          SELECT id FROM timetables WHERE status = 'published' ORDER BY created_at DESC LIMIT 1
        )
      ORDER BY ts.day_of_week, ts.start_time
    `, [staffId]);
    
    // Convert to timetable grid format
    const timetable = Array.from({ length: 5 }, () => Array.from({ length: 8 }, () => []));
    
    result.rows.forEach(slot => {
      const day = slot.day_of_week - 1; // Convert to 0-based
      const hour = parseInt(slot.start_time.split(':')[0]);
      const period = hour - 9; // Assuming 9 AM start
      
      if (day >= 0 && day < 5 && period >= 0 && period < 8) {
        const entry = {
          course_code: slot.course_code,
          course_name: slot.course_name,
          room: slot.room_id,
          building: slot.building,
          slot_type: slot.slot_type,
          time: `${slot.start_time}-${slot.end_time}`
        };
        timetable[day][period].push(entry);
      }
    });
    
    res.json({
      success: true,
      timetable: timetable,
      slots: result.rows
    });
  } catch (error) {
    console.error('Error fetching staff schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Get room schedule for planning
router.get('/room-schedule', verifyStaff, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        r.room_id,
        r.building,
        r.capacity,
        r.room_type,
        s.course_code,
        s.course_name,
        u.name as instructor_name
      FROM timetable_slots ts
      JOIN subjects s ON ts.subject_id = s.id
      JOIN rooms r ON ts.room_id = r.id
      LEFT JOIN users u ON ts.instructor_id = u.id
      WHERE ts.timetable_id IN (
        SELECT id FROM timetables WHERE status = 'published'
      )
      ORDER BY r.room_id, ts.day_of_week, ts.start_time
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching room schedule:', error);
    res.status(500).json({ error: 'Failed to fetch room schedule' });
  }
});

module.exports = router;