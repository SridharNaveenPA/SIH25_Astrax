const pool = require('./src/db');
const TimetableGenerator = require('./src/timetable_generator');

async function testTimetableGeneration() {
  try {
    console.log('Testing timetable generation...');
    
    // Fetch subjects with instructor information
    const subjectsResult = await pool.query(`
      SELECT s.*, u.name as instructor_name
      FROM subjects s
      LEFT JOIN users u ON s.instructor_id = u.id
      ORDER BY s.course_code
    `);
    
    console.log(`Found ${subjectsResult.rows.length} subjects`);
    
    // Fetch rooms
    const roomsResult = await pool.query('SELECT * FROM rooms ORDER BY room_id');
    console.log(`Found ${roomsResult.rows.length} rooms`);
    
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

    console.log('Data prepared. Calling timetable generator...');
    console.log('Subjects:', Object.keys(subjects));
    console.log('Rooms:', Object.keys(rooms));
    console.log('Faculty IDs:', Object.keys(faculty));

    const generator = new TimetableGenerator();
    const result = await generator.generateMasterTimetable(subjects, rooms, faculty, {});
    
    console.log('Generation result:', result);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit();
  }
}

testTimetableGeneration();