# Timetable Management System - Dynamic Dashboard Update

## Overview
This update implements dynamic, real-time dashboards for both Admin and Student profiles with full enrollment functionality.

## Features Implemented

### Admin Dashboard
- **Dynamic Statistics**: Real-time counts for Total Subjects, Faculty Members, Rooms Available, and Timetables Generated
- **Real-time Updates**: All statistics automatically update from the database
- **Timetable Management**: Full CRUD operations for timetables

### Student Dashboard  
- **Dynamic Statistics**: Real-time counts for Enrolled Subjects, Total Credits, and Classes This Week
- **Subject Enrollment**: Students can enroll/drop subjects with real-time capacity checking
- **Course Information**: Displays Course Code, Course Name, Credits, Course Type, Instructor Name, and Available Slots
- **Real-time Updates**: All data updates automatically when students enroll/drop subjects

## Database Setup

### 1. Run the Database Update Script
Execute the following SQL commands in your PostgreSQL database:

```sql
-- Copy and paste the contents of database_update.sql
-- Or run: psql -d your_database_name -f database_update.sql
```

### 2. Required Database Tables
The script creates these new tables:
- `student_enrollments` - Tracks student subject enrollments
- `timetables` - Stores timetable information
- `timetable_slots` - Individual class sessions
- `student_timetable_view` - Student-specific timetable views

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Make sure your `.env` file contains:
```
DATABASE_URL=postgres://username:password@localhost:5432/timetable_db
JWT_SECRET=your_jwt_secret
```

### 3. Start the Backend Server
```bash
npm run dev
# or
npm start
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend/student-timify
npm install
```

### 2. Start the Frontend
```bash
npm run dev
```

## API Endpoints

### Admin Endpoints
- `GET /api/admin/dashboard-stats` - Get admin dashboard statistics
- `GET /api/admin/timetables` - Get all timetables
- `POST /api/admin/timetables` - Create new timetable
- `PUT /api/admin/timetables/:id` - Update timetable
- `DELETE /api/admin/timetables/:id` - Delete timetable

### Student Endpoints
- `GET /api/student/dashboard-stats` - Get student dashboard statistics
- `GET /api/student/available-subjects` - Get subjects available for enrollment
- `GET /api/student/my-subjects` - Get student's enrolled subjects
- `POST /api/student/enroll/:subjectId` - Enroll in a subject
- `DELETE /api/student/drop/:subjectId` - Drop a subject
- `GET /api/student/timetable` - Get student's personalized timetable

## Usage

### Admin Features
1. **Dashboard Statistics**: View real-time counts of subjects, faculty, rooms, and timetables
2. **Subject Management**: Create and manage subjects with instructors
3. **Faculty Management**: Add and manage faculty members
4. **Room Management**: Manage available rooms and their capacities
5. **Timetable Generation**: Create and publish timetables

### Student Features
1. **Dashboard Statistics**: View enrolled subjects, total credits, and weekly classes
2. **Subject Enrollment**: Browse available subjects and enroll with real-time capacity checking
3. **Course Information**: See detailed course information including instructor and available slots
4. **Enrollment Management**: Drop subjects you're enrolled in
5. **Personal Timetable**: View your personalized class schedule

## Real-time Features

### Dynamic Updates
- All dashboard statistics update automatically from the database
- Subject enrollment counts update in real-time
- Available slots are calculated dynamically
- Student enrollment status updates immediately

### Data Validation
- Prevents duplicate enrollments
- Checks subject capacity before enrollment
- Validates student authentication for all operations
- Ensures data integrity with foreign key constraints

## Testing the System

### 1. Create Test Data
```sql
-- Insert sample subjects
INSERT INTO subjects (course_code, course_name, semester, credits, course_type, max_capacity, instructor_id)
VALUES 
  ('CS301', 'Data Structures', 'Fall 2024', 3, 'Theory', 60, 2),
  ('CS302', 'Database Systems', 'Fall 2024', 3, 'Theory', 50, 3),
  ('MA301', 'Discrete Mathematics', 'Fall 2024', 4, 'Theory', 55, 4);

-- Insert sample rooms
INSERT INTO rooms (room_id, building, capacity, room_type)
VALUES 
  ('A101', 'Building A', 60, 'Lecture Hall'),
  ('A102', 'Building A', 50, 'Lecture Hall'),
  ('B201', 'Building B', 40, 'Laboratory');

-- Insert sample faculty
INSERT INTO faculty (user_id, name, email, department)
VALUES 
  (2, 'Dr. Smith', 'smith@university.edu', 'Computer Science'),
  (3, 'Dr. Johnson', 'johnson@university.edu', 'Computer Science'),
  (4, 'Dr. Brown', 'brown@university.edu', 'Mathematics');
```

### 2. Test Student Enrollment
1. Login as a student
2. Go to Subject Enrollment tab
3. Click "Enroll" on available subjects
4. Check that statistics update in real-time
5. Verify enrollment appears in "My Subjects" tab

### 3. Test Admin Dashboard
1. Login as admin
2. Check that statistics show real counts from database
3. Add new subjects/faculty/rooms
4. Verify statistics update automatically

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and connection string is correct
2. **CORS Issues**: Backend runs on port 4000, frontend on port 5173
3. **Authentication**: Make sure JWT tokens are properly stored in localStorage
4. **API Errors**: Check browser console and backend logs for error messages

### Database Issues
- Ensure all foreign key constraints are satisfied
- Check that referenced users exist before creating enrollments
- Verify subject and room IDs exist before creating timetable slots

## Next Steps

### Future Enhancements
1. **Real-time Notifications**: WebSocket integration for live updates
2. **Timetable Generation Algorithm**: Automated timetable creation
3. **Conflict Detection**: Check for scheduling conflicts
4. **Reporting**: Generate enrollment and attendance reports
5. **Mobile App**: React Native mobile application

### Performance Optimizations
1. **Database Indexing**: Optimize queries with proper indexes
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Pagination**: Add pagination for large datasets
4. **API Rate Limiting**: Implement rate limiting for API endpoints
