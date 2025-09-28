const express = require('express');
const pool = require('./db');
const router = express.Router();

// Middleware to verify student authentication
const verifyStudent = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get student dashboard statistics
router.get('/dashboard-stats', verifyStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get enrolled subjects count
    const enrolledSubjectsResult = await pool.query(
      'SELECT COUNT(*) as count FROM student_enrollments WHERE student_id = $1 AND status = $2',
      [studentId, 'enrolled']
    );
    
    // Get total credits
    const totalCreditsResult = await pool.query(`
      SELECT COALESCE(SUM(s.credits), 0) as total_credits
      FROM student_enrollments se
      JOIN subjects s ON se.subject_id = s.id
      WHERE se.student_id = $1 AND se.status = $2
    `, [studentId, 'enrolled']);
    
    // Get classes this week (assuming current week)
    const classesThisWeekResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM timetable_slots ts
      JOIN student_enrollments se ON ts.subject_id = se.subject_id
      WHERE se.student_id = $1 AND se.status = $2
      AND ts.timetable_id IN (
        SELECT id FROM timetables WHERE status = 'published'
      )
    `, [studentId, 'enrolled']);
    
    res.json({
      enrolledSubjects: parseInt(enrolledSubjectsResult.rows[0].count),
      totalCredits: parseInt(totalCreditsResult.rows[0].total_credits),
      classesThisWeek: parseInt(classesThisWeekResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get available subjects for enrollment
router.get('/available-subjects', verifyStudent, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.course_code,
        s.course_name,
        s.credits,
        s.course_type,
        s.max_capacity,
        u.name as instructor_name,
        COUNT(se.id) as enrolled_count,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM student_enrollments se2 
            WHERE se2.student_id = $1 AND se2.subject_id = s.id AND se2.status = 'enrolled'
          ) THEN true 
          ELSE false 
        END as is_enrolled
      FROM subjects s
      LEFT JOIN users u ON s.instructor_id = u.id
      LEFT JOIN student_enrollments se ON s.id = se.subject_id AND se.status = 'enrolled'
      GROUP BY s.id, s.course_code, s.course_name, s.credits, s.course_type, s.max_capacity, u.name
      ORDER BY s.course_code
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching available subjects:', error);
    res.status(500).json({ error: 'Failed to fetch available subjects' });
  }
});

// Enroll in a subject
router.post('/enroll/:subjectId', verifyStudent, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const studentId = req.user.id;
    
    // Check if already enrolled
    const existingEnrollment = await pool.query(
      'SELECT id FROM student_enrollments WHERE student_id = $1 AND subject_id = $2',
      [studentId, subjectId]
    );
    
    if (existingEnrollment.rows.length > 0) {
      return res.status(400).json({ error: 'Already enrolled in this subject' });
    }
    
    // Check if subject exists and has capacity
    const subjectResult = await pool.query(`
      SELECT s.max_capacity, COUNT(se.id) as enrolled_count
      FROM subjects s
      LEFT JOIN student_enrollments se ON s.id = se.subject_id AND se.status = 'enrolled'
      WHERE s.id = $1
      GROUP BY s.id, s.max_capacity
    `, [subjectId]);
    
    if (subjectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    const { max_capacity, enrolled_count } = subjectResult.rows[0];
    if (parseInt(enrolled_count) >= parseInt(max_capacity)) {
      return res.status(400).json({ error: 'Subject is full' });
    }
    
    // Enroll the student
    const enrollmentResult = await pool.query(
      'INSERT INTO student_enrollments (student_id, subject_id) VALUES ($1, $2) RETURNING *',
      [studentId, subjectId]
    );
    
    res.status(201).json(enrollmentResult.rows[0]);
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Failed to enroll in subject' });
  }
});

// Drop a subject
router.delete('/drop/:subjectId', verifyStudent, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const studentId = req.user.id;
    
    const result = await pool.query(
      'UPDATE student_enrollments SET status = $1 WHERE student_id = $2 AND subject_id = $3 RETURNING *',
      ['dropped', studentId, subjectId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    res.json({ message: 'Successfully dropped subject' });
  } catch (error) {
    console.error('Error dropping subject:', error);
    res.status(500).json({ error: 'Failed to drop subject' });
  }
});

// Get student's enrolled subjects
router.get('/my-subjects', verifyStudent, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        se.id,
        se.enrolled_at,
        se.status,
        s.course_code,
        s.course_name,
        s.credits,
        s.course_type,
        u.name as instructor_name
      FROM student_enrollments se
      JOIN subjects s ON se.subject_id = s.id
      LEFT JOIN users u ON s.instructor_id = u.id
      WHERE se.student_id = $1 AND se.status = 'enrolled'
      ORDER BY s.course_code
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    res.status(500).json({ error: 'Failed to fetch enrolled subjects' });
  }
});

// Get student's timetable
router.get('/timetable', verifyStudent, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ts.day_of_week,
        ts.time_slot,
        ts.start_time,
        ts.end_time,
        ts.slot_type,
        s.course_code,
        s.course_name,
        r.room_id,
        r.building,
        u.name as instructor_name
      FROM timetable_slots ts
      JOIN student_enrollments se ON ts.subject_id = se.subject_id
      JOIN subjects s ON ts.subject_id = s.id
      JOIN rooms r ON ts.room_id = r.id
      LEFT JOIN users u ON ts.instructor_id = u.id
      WHERE se.student_id = $1 
        AND se.status = 'enrolled'
        AND ts.timetable_id IN (
          SELECT id FROM timetables WHERE status = 'published' ORDER BY created_at DESC LIMIT 1
        )
      ORDER BY ts.day_of_week, ts.time_slot
    `, [req.user.id]);
    
    // Convert to timetable grid format
    const timetable = Array.from({ length: 5 }, () => Array.from({ length: 8 }, () => []));
    
    result.rows.forEach(slot => {
      const day = slot.day_of_week - 1; // Convert to 0-based
      const period = slot.time_slot; // Use time_slot directly
      
      if (day >= 0 && day < 5 && period >= 0 && period < 8) {
        const entry = {
          course_code: slot.course_code,
          course_name: slot.course_name,
          instructor: slot.instructor_name,
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
    console.error('Error fetching student timetable:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch timetable' });
  }
});

module.exports = router;
