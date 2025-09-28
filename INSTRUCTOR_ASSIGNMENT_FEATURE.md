# Instructor Assignment Feature Implementation

## Overview
This document describes the implementation of the instructor assignment feature that allows admin users to assign instructors to subjects during subject creation and updates the staff dashboard to display assigned subjects dynamically.

## Features Implemented

### 1. Admin Panel - Subject Creation with Instructor Assignment
- **Location**: `frontend/student-timify/src/components/SubjectManagement.tsx`
- **Functionality**: 
  - Dropdown to select instructors when creating/editing subjects
  - Shows instructor name and department in dropdown
  - Allows "No instructor assigned" option
  - Real-time fetching of available instructors from the database

### 2. Staff Dashboard - Dynamic Subject Display
- **Location**: `frontend/student-timify/src/pages/StaffDashboard.tsx`
- **Functionality**: 
  - Displays subjects assigned by the admin (replaces hardcoded data)
  - Shows real-time statistics (subjects assigned, total students, etc.)
  - Dynamic schedule display (when timetable is generated)
  - Subject details include enrollment counts, room assignments, course type

### 3. Backend API Endpoints

#### Admin Routes (`backend/src/admin_routes.js`)
- `GET /api/admin/instructors` - Fetches all available instructors
- `GET /api/admin/subjects` - Fetches subjects with instructor details
- `POST /api/admin/subjects` - Creates subject with instructor assignment
- `PUT /api/admin/subjects/:id` - Updates subject including instructor assignment

#### Staff Routes (`backend/src/staff_routes.js`) - **NEW**
- `GET /api/staff/dashboard-stats` - Fetches staff dashboard statistics
- `GET /api/staff/my-subjects` - Fetches subjects assigned to the logged-in staff member
- `GET /api/staff/schedule` - Fetches staff schedule from timetable
- `GET /api/staff/room-schedule` - Fetches room availability schedule

### 4. Database Schema Support
The following tables support the instructor assignment feature:

```sql
-- Subjects table with instructor_id foreign key
CREATE TABLE subjects (
  instructor_id INTEGER REFERENCES users(id),
  -- other fields...
);

-- Faculty table for extended staff information
CREATE TABLE faculty (
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100),
  department VARCHAR(50),
  -- other fields...
);
```

## Technical Implementation Details

### Frontend Implementation

#### Subject Management Component
```typescript
interface Instructor {
  id: number;
  name: string;
  department: string;
}

// Fetch instructors on component mount
const fetchInstructors = async () => {
  const response = await fetch('http://localhost:4000/api/admin/instructors');
  const data = await response.json();
  setInstructors(data);
};

// Instructor dropdown in form
<select
  id="instructor_id"
  value={formData.instructor_id}
  onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
>
  <option value="">No instructor assigned</option>
  {instructors.map((instructor) => (
    <option key={instructor.id} value={instructor.id}>
      {instructor.name} ({instructor.department})
    </option>
  ))}
</select>
```

#### Staff Dashboard Component
```typescript
interface Subject {
  course_code: string;
  course_name: string;
  enrolled_students: number;
  max_capacity: number;
  credits: number;
  // other fields...
}

// Fetch assigned subjects
const fetchMySubjects = async () => {
  const response = await fetch('http://localhost:4000/api/staff/my-subjects', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setMySubjects(data);
};
```

### Backend Implementation

#### Staff Authentication Middleware
```javascript
const verifyStaff = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== 'staff') {
    return res.status(403).json({ error: 'Access denied' });
  }
  req.user = decoded;
  next();
};
```

#### Key SQL Queries

**Fetch subjects assigned to staff:**
```sql
SELECT 
  s.*, 
  COUNT(se.id) as enrolled_students
FROM subjects s
LEFT JOIN student_enrollments se ON s.id = se.subject_id 
WHERE s.instructor_id = ? 
GROUP BY s.id
```

**Fetch available instructors:**
```sql
SELECT u.id, u.name, f.department 
FROM users u 
JOIN faculty f ON u.id = f.user_id 
WHERE u.role = 'staff'
```

## Testing the Feature

### Prerequisites
1. Database with sample data (use `sample_data.sql`)
2. Backend server running on port 4000
3. Frontend server running

### Test Scenarios

#### 1. Admin Creates Subject with Instructor
1. Login as admin
2. Navigate to Admin Dashboard → Subjects tab
3. Click "Add New Subject"
4. Fill in subject details
5. Select an instructor from dropdown
6. Save subject
7. Verify instructor appears in subject list

#### 2. Staff Views Assigned Subjects
1. Login as staff member
2. Navigate to Staff Dashboard
3. Check "My Subjects" tab
4. Verify subjects assigned by admin appear
5. Check dashboard statistics are updated

#### 3. Subject Assignment Update
1. Admin edits existing subject
2. Changes instructor assignment
3. Staff dashboard reflects updated assignment

## File Changes Made

### New Files
- `backend/src/staff_routes.js` - Staff-specific API routes
- `sample_data.sql` - Sample data for testing
- `INSTRUCTOR_ASSIGNMENT_FEATURE.md` - This documentation

### Modified Files
- `backend/src/server.js` - Added staff routes
- `frontend/student-timify/src/pages/StaffDashboard.tsx` - Dynamic data fetching
- `frontend/student-timify/src/components/SubjectManagement.tsx` - Enhanced with instructor assignment

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/instructors` | Get available instructors | Admin |
| GET | `/api/admin/subjects` | Get subjects with instructors | Admin |
| POST | `/api/admin/subjects` | Create subject with instructor | Admin |
| PUT | `/api/admin/subjects/:id` | Update subject instructor | Admin |
| GET | `/api/staff/dashboard-stats` | Get staff statistics | Staff |
| GET | `/api/staff/my-subjects` | Get assigned subjects | Staff |
| GET | `/api/staff/schedule` | Get staff schedule | Staff |

## Security Considerations
- JWT token authentication for all API calls
- Role-based authorization (admin/staff/student)
- Input validation on all form submissions
- SQL injection prevention using parameterized queries

## Future Enhancements
1. Bulk instructor assignment
2. Instructor workload balancing
3. Email notifications for new assignments
4. Conflict detection for instructor schedules
5. Advanced filtering and search in subject management

This implementation provides a complete instructor assignment workflow from admin creation to staff dashboard display, replacing the previous hardcoded subject listings with dynamic, database-driven content.