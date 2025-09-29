const express = require('express');
const pool = require('./db');
const TimetableGenerator = require('./timetable_generator');
const ExportUtils = require('./export_utils');
const PDFUtils = require('./pdf_utils');
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
    // Start transaction
    await pool.query('BEGIN');
    
    // Delete related timetable slots first
    await pool.query('DELETE FROM timetable_slots WHERE room_id = $1', [id]);
    
    // Delete the room
    const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Room not found' });
    }
    
    await pool.query('COMMIT');
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
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
    // Start transaction
    await pool.query('BEGIN');
    
    // Delete related records first to avoid foreign key constraint violations
    await pool.query('DELETE FROM faculty_subjects WHERE subject_id = $1', [id]);
    await pool.query('DELETE FROM student_enrollments WHERE subject_id = $1', [id]);
    await pool.query('DELETE FROM subject_prerequisites WHERE subject_id = $1 OR prerequisite_id = $1', [id]);
    await pool.query('DELETE FROM timetable_slots WHERE subject_id = $1', [id]);
    
    // Delete the subject
    const result = await pool.query('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    await pool.query('COMMIT');
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
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
    // Start transaction
    await pool.query('BEGIN');
    
    // Get user_id first
    const facultyResult = await pool.query('SELECT user_id FROM faculty WHERE id = $1', [id]);
    if (facultyResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Faculty not found' });
    }
    
    const userId = facultyResult.rows[0].user_id;
    
    // Delete related records first
    await pool.query('DELETE FROM faculty_subjects WHERE faculty_id = $1', [id]);
    
    // Update subjects that reference this instructor to NULL
    await pool.query('UPDATE subjects SET instructor_id = NULL WHERE instructor_id = $1', [userId]);
    
    // Delete timetable slots assigned to this instructor
    await pool.query('DELETE FROM timetable_slots WHERE instructor_id = $1', [userId]);
    
    // Delete faculty record
    await pool.query('DELETE FROM faculty WHERE id = $1', [id]);
    
    // Delete user account
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    
    await pool.query('COMMIT');
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error deleting faculty:', error);
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
});

// Get available instructors (staff users)
router.get('/instructors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, 
        COALESCE(f.department, 'Computer Science') as department 
      FROM users u 
      LEFT JOIN faculty f ON u.id = f.user_id 
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
    const existing = result.rows.reduce((acc, row) => {
      acc[row.semester_number] = row;
      return acc;
    }, {});
    const merged = Array.from({ length: 8 }, (_, i) => {
      const sem = i + 1;
      return existing[sem] || { id: null, semester_number: sem, max_credits: null };
    });
    res.json(merged);
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
      `INSERT INTO credit_limits (semester_number, max_credits) VALUES ($1, $2)
       ON CONFLICT (semester_number) DO UPDATE SET max_credits = EXCLUDED.max_credits
       RETURNING *`,
      [semester_number, max_credits]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating credit limit:', error);
    res.status(500).json({ error: 'Failed to update credit limit' });
  }
});

router.delete('/credit-limits/:semester_number', async (req, res) => {
  const { semester_number } = req.params;
  try {
    const result = await pool.query('DELETE FROM credit_limits WHERE semester_number = $1 RETURNING *', [semester_number]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credit limit not found' });
    }
    res.json({ message: 'Credit limit deleted successfully' });
  } catch (error) {
    console.error('Error deleting credit limit:', error);
    res.status(500).json({ error: 'Failed to delete credit limit' });
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

// Test database connectivity and data
router.get('/test-db', async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const subjectsResult = await pool.query('SELECT COUNT(*) FROM subjects');
    const roomsResult = await pool.query('SELECT COUNT(*) FROM rooms');
    const facultyResult = await pool.query('SELECT COUNT(*) FROM faculty');
    const timetablesResult = await pool.query('SELECT COUNT(*) FROM timetables');
    const slotsResult = await pool.query('SELECT COUNT(*) FROM timetable_slots');
    
    res.json({
      success: true,
      counts: {
        users: parseInt(usersResult.rows[0].count),
        subjects: parseInt(subjectsResult.rows[0].count),
        rooms: parseInt(roomsResult.rows[0].count),
        faculty: parseInt(facultyResult.rows[0].count),
        timetables: parseInt(timetablesResult.rows[0].count),
        timetable_slots: parseInt(slotsResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

// Generate master timetable
router.post('/generate-timetable', async (req, res) => {
  try {
    console.log('Starting timetable generation...');
    
    // Fetch subjects with instructor information
    const subjectsResult = await pool.query(`
      SELECT s.*, u.name as instructor_name
      FROM subjects s
      LEFT JOIN users u ON s.instructor_id = u.id
      ORDER BY s.course_code
    `);
    
    console.log(`Found ${subjectsResult.rows.length} subjects`);
    
    if (subjectsResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No subjects found. Please add subjects first or run database initialization.' 
      });
    }
    
    // Fetch rooms
    const roomsResult = await pool.query('SELECT * FROM rooms ORDER BY room_id');
    console.log(`Found ${roomsResult.rows.length} rooms`);
    
    if (roomsResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No rooms found. Please add rooms first or run database initialization.' 
      });
    }
    
    // Fetch faculty with availability
    const facultyResult = await pool.query(`
      SELECT u.id, u.name, f.department, f.availability
      FROM users u
      JOIN faculty f ON u.id = f.user_id
      WHERE u.role = 'staff'
    `);
    console.log(`Found ${facultyResult.rows.length} faculty members`);
    
    // Prepare data structures for timetable generation
    const subjects = {};
    subjectsResult.rows.forEach(subject => {
      subjects[subject.course_name] = {
        id: subject.id,
        course_code: subject.course_code,
        course_name: subject.course_name,
        semester: subject.semester,
        credits: subject.credits,
        course_type: subject.course_type,
        min_lab_hours: subject.min_lab_hours,
        min_theory_hours: subject.min_theory_hours,
        max_capacity: subject.max_capacity,
        instructor_id: subject.instructor_id,
        instructor_name: subject.instructor_name
      };
    });
    
    const rooms = {};
    roomsResult.rows.forEach(room => {
      rooms[room.room_id] = {
        id: room.id,
        building: room.building,
        capacity: room.capacity,
        room_type: room.room_type
      };
    });
    
    const faculty = {};
    facultyResult.rows.forEach(f => {
      faculty[f.id] = {
        name: f.name,
        department: f.department,
        availability: f.availability || {},
        unavailable_slots: [] // Can be populated from availability data
      };
    });
    
    console.log('Calling Python timetable generator...');
    const generator = new TimetableGenerator();
    const result = await generator.generateMasterTimetable(subjects, rooms, faculty, {});
    console.log('Python generator result:', result.success ? 'Success' : 'Failed', result.message || '');
    
    if (!result.success) {
      console.error('Timetable generation failed:', result);
      return res.status(400).json(result);
    }
    
    if (result.success) {
      // Clear any existing published timetables first
      await pool.query("UPDATE timetables SET status = 'archived' WHERE status = 'published'");
      
      // Store the generated timetable in database
      const timetableResult = await pool.query(
        'INSERT INTO timetables (name, semester, academic_year, created_by, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['Master Timetable', 'Current', '2025-26', req.body.created_by || 1, 'published']
      );
      
      const timetableId = timetableResult.rows[0].id;
      
      // Store individual time slots
      if (result.timetable && result.schedule_data) {
        for (const slot of result.schedule_data) {
          const subject = subjects[slot.subject];
          const room = Object.keys(rooms).find(r => r === slot.room);
          const roomData = rooms[room];
          
          if (subject && roomData) {
            await pool.query(
              `INSERT INTO timetable_slots 
               (timetable_id, subject_id, room_id, instructor_id, day_of_week, time_slot, start_time, end_time, slot_type)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                timetableId,
                subject.id,
                roomData.id,
                subject.instructor_id,
                slot.day + 1, // day_of_week starts from 1
                slot.time_slot, // Add the time_slot value
                `${9 + slot.period}:00`, // Assuming 9 AM start
                `${10 + slot.period}:00`,
                subject.course_type === 'Lab' ? 'lab' : 'theory'
              ]
            );
          }
        }
      }
      
      res.json({
        success: true,
        timetable: result.timetable,
        timetableId: timetableId,
        message: 'Master timetable generated and saved successfully'
      });
    } else {
      res.status(400).json(result);
    }
    
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({ error: 'Failed to generate timetable' });
  }
});

// Get master timetable
router.get('/master-timetable', async (req, res) => {
  try {
    // First try to get from database
    const result = await pool.query(`
      SELECT 
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        ts.slot_type,
        s.course_code,
        s.course_name,
        r.room_id,
        r.building,
        u.name as instructor_name
      FROM timetable_slots ts
      JOIN subjects s ON ts.subject_id = s.id
      JOIN rooms r ON ts.room_id = r.id
      LEFT JOIN users u ON ts.instructor_id = u.id
      WHERE ts.timetable_id IN (
        SELECT id FROM timetables WHERE status = 'published' ORDER BY created_at DESC LIMIT 1
      )
      ORDER BY ts.day_of_week, ts.start_time
    `);
    
    if (result.rows.length > 0) {
      // Convert to timetable grid format
      const timetable = Array.from({ length: 5 }, () => Array.from({ length: 8 }, () => []));
      
      result.rows.forEach(slot => {
        const day = slot.day_of_week - 1; // Convert to 0-based
        const hour = parseInt(slot.start_time.split(':')[0]);
        const period = hour - 9; // Assuming 9 AM start
        
        if (day >= 0 && day < 5 && period >= 0 && period < 8) {
          const entry = `${slot.course_code} (${slot.instructor_name}, ${slot.room_id})`;
          timetable[day][period].push(entry);
        }
      });
      
      res.json({
        success: true,
        timetable: timetable,
        slots: result.rows
      });
    } else {
      // No saved timetable found, generate a fresh one
      console.log('No saved timetable found, generating fresh timetable...');
      
      // Fetch data and generate timetable
      const subjectsResult = await pool.query(`
        SELECT s.*, u.name as instructor_name
        FROM subjects s
        LEFT JOIN users u ON s.instructor_id = u.id
        ORDER BY s.course_code
      `);
      
      const roomsResult = await pool.query('SELECT * FROM rooms ORDER BY room_id');
      const facultyResult = await pool.query(`
        SELECT u.id, u.name, f.department, f.availability
        FROM users u
        JOIN faculty f ON u.id = f.user_id
        WHERE u.role = 'staff'
      `);

      // Prepare data structures
      const subjects = {};
      subjectsResult.rows.forEach(subject => {
        subjects[subject.course_name] = {
          id: subject.id,
          course_code: subject.course_code,
          course_name: subject.course_name,
          semester: subject.semester,
          credits: subject.credits,
          course_type: subject.course_type,
          min_lab_hours: subject.min_lab_hours,
          min_theory_hours: subject.min_theory_hours,
          max_capacity: subject.max_capacity,
          instructor_id: subject.instructor_id,
          instructor_name: subject.instructor_name
        };
      });
      
      const rooms = {};
      roomsResult.rows.forEach(room => {
        rooms[room.room_id] = {
          id: room.id,
          building: room.building,
          capacity: room.capacity,
          room_type: room.room_type
        };
      });
      
      const faculty = {};
      facultyResult.rows.forEach(f => {
        faculty[f.id] = {
          name: f.name,
          department: f.department,
          availability: f.availability || {},
          unavailable_slots: []
        };
      });

      const generator = new TimetableGenerator();
      const generatedResult = await generator.generateMasterTimetable(subjects, rooms, faculty, {});
      
      if (generatedResult.success) {
        res.json({
          success: true,
          timetable: generatedResult.timetable,
          message: 'Fresh timetable generated'
        });
      } else {
        res.status(500).json(generatedResult);
      }
    }
  } catch (error) {
    console.error('Error fetching master timetable:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch master timetable',
      message: error.message 
    });
  }
});

// Export master timetable as Excel
router.get('/master-timetable/export/excel', async (req, res) => {
  try {
    // Get subjects, rooms, faculty data
    const subjectsResult = await pool.query(`
      SELECT s.*, u.name as instructor_name
      FROM subjects s
      LEFT JOIN users u ON s.instructor_id = u.id
      ORDER BY s.course_code
    `);
    
    const roomsResult = await pool.query('SELECT * FROM rooms ORDER BY room_id');
    
    // Convert to format expected by generator
    const subjects = {};
    subjectsResult.rows.forEach(subject => {
      subjects[subject.course_code] = {
        course_code: subject.course_code,
        course_name: subject.course_name,
        instructor_name: subject.instructor_name,
        instructor_id: subject.instructor_id,
        course_type: subject.course_type
      };
    });
    
    const rooms = {};
    roomsResult.rows.forEach(room => {
      rooms[room.room_id] = room;
    });
    
    // Generate timetable
    const generator = new TimetableGenerator();
    const result = await generator.generateMasterTimetable(subjects, rooms, {}, {});
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to generate timetable' });
    }
    
    const metadata = {
      name: 'Master Timetable',
      department: 'All Departments',
      generatedBy: 'Admin'
    };
    
    const excelBuffer = ExportUtils.generateExcelTimetable(result, 'master', metadata);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="master_timetable.xlsx"');
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error exporting master timetable to Excel:', error);
    res.status(500).json({ success: false, message: 'Error exporting timetable' });
  }
});

// Export master timetable as CSV
router.get('/master-timetable/export/csv', async (req, res) => {
  try {
    // Get subjects, rooms, faculty data
    const subjectsResult = await pool.query(`
      SELECT s.*, u.name as instructor_name
      FROM subjects s
      LEFT JOIN users u ON s.instructor_id = u.id
      ORDER BY s.course_code
    `);
    
    const roomsResult = await pool.query('SELECT * FROM rooms ORDER BY room_id');
    
    // Convert to format expected by generator
    const subjects = {};
    subjectsResult.rows.forEach(subject => {
      subjects[subject.course_code] = {
        course_code: subject.course_code,
        course_name: subject.course_name,
        instructor_name: subject.instructor_name,
        instructor_id: subject.instructor_id,
        course_type: subject.course_type
      };
    });
    
    const rooms = {};
    roomsResult.rows.forEach(room => {
      rooms[room.room_id] = room;
    });
    
    // Generate timetable
    const generator = new TimetableGenerator();
    const result = await generator.generateMasterTimetable(subjects, rooms, {}, {});
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to generate timetable' });
    }
    
    const metadata = {
      name: 'Master Timetable',
      department: 'All Departments',
      generatedBy: 'Admin'
    };
    
    const csvContent = ExportUtils.generateCSVData(result, 'master', metadata);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="master_timetable.csv"');
    res.send('\uFEFF' + csvContent);
    
  } catch (error) {
    console.error('Error exporting master timetable to CSV:', error);
    res.status(500).json({ success: false, message: 'Error exporting timetable' });
  }
});

// Export staff timetable as Excel
router.get('/staff-timetable/export/excel/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    
    // Get faculty info
    const facultyResult = await pool.query(
      'SELECT name, email, department FROM users WHERE id = $1 AND role = $2',
      [facultyId, 'staff']
    );
    
    if (facultyResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }
    
    const faculty = facultyResult.rows[0];
    
    // Get staff timetable data
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
        r.building
      FROM timetable_slots ts
      JOIN subjects s ON ts.subject_id = s.id
      JOIN rooms r ON ts.room_id = r.id
      WHERE ts.instructor_id = $1
        AND ts.timetable_id IN (
          SELECT id FROM timetables WHERE status = 'published' ORDER BY created_at DESC LIMIT 1
        )
      ORDER BY ts.day_of_week, ts.time_slot
    `, [facultyId]);
    
    // Convert to timetable grid format
    const timetable = Array.from({ length: 5 }, () => Array.from({ length: 8 }, () => []));
    
    result.rows.forEach(slot => {
      const day = slot.day_of_week - 1;
      const period = slot.time_slot;
      
      if (day >= 0 && day < 5 && period >= 0 && period < 8) {
        const entry = {
          course_code: slot.course_code,
          instructor: faculty.name,
          room: slot.room_id
        };
        timetable[day][period].push(entry);
      }
    });
    
    const timetableData = {
      timetable: timetable,
      schedule_data: result.rows
    };
    
    const metadata = {
      name: faculty.name,
      department: faculty.department,
      type: 'Staff'
    };
    
    const excelBuffer = ExportUtils.generateExcelTimetable(timetableData, 'staff', metadata);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${faculty.name}_timetable.xlsx"`);
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error exporting staff timetable to Excel:', error);
    res.status(500).json({ success: false, message: 'Error exporting timetable' });
  }
});

// Export master timetable as PDF
router.get('/master-timetable/export/pdf', async (req, res) => {
  try {
    // Get subjects, rooms, faculty data
    const subjectsResult = await pool.query(`
      SELECT s.*, u.name as instructor_name
      FROM subjects s
      LEFT JOIN users u ON s.instructor_id = u.id
      ORDER BY s.course_code
    `);
    
    const roomsResult = await pool.query('SELECT * FROM rooms ORDER BY room_id');
    
    // Convert to format expected by generator
    const subjects = {};
    subjectsResult.rows.forEach(subject => {
      subjects[subject.course_code] = {
        course_code: subject.course_code,
        course_name: subject.course_name,
        instructor_name: subject.instructor_name,
        instructor_id: subject.instructor_id,
        course_type: subject.course_type
      };
    });
    
    const rooms = {};
    roomsResult.rows.forEach(room => {
      rooms[room.room_id] = room;
    });
    
    // Generate timetable
    const generator = new TimetableGenerator();
    const result = await generator.generateMasterTimetable(subjects, rooms, {}, {});
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Failed to generate timetable' });
    }
    
    const metadata = {
      name: 'Master Timetable',
      department: 'All Departments',
      generatedBy: 'Admin'
    };
    
    const pdfBuffer = PDFUtils.generateTimetablePDF(result, 'master', metadata);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="master_timetable.pdf"');
    res.send(Buffer.from(pdfBuffer, 'binary'));
    
  } catch (error) {
    console.error('Error exporting master timetable to PDF:', error);
    res.status(500).json({ success: false, message: 'Error exporting timetable' });
  }
});

// Reset timetables count (delete all generated timetables)
router.delete('/reset-timetables', async (req, res) => {
  try {
    // Delete all timetable slots first (due to foreign key constraints)
    await pool.query('DELETE FROM timetable_slots');
    
    // Delete all student timetable views
    await pool.query('DELETE FROM student_timetable_view');
    
    // Delete all timetables
    const result = await pool.query('DELETE FROM timetables RETURNING *');
    
    res.json({ 
      success: true, 
      message: `Successfully reset timetables. Deleted ${result.rowCount} timetables.`,
      deletedCount: result.rowCount
    });
  } catch (error) {
    console.error('Error resetting timetables:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reset timetables' 
    });
  }
});

module.exports = router;
