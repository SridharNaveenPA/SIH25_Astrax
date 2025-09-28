# API Testing Script

This document provides curl commands to test the instructor assignment feature APIs.

## Prerequisites
- Backend server running on http://localhost:4000
- Sample data loaded in database

## Admin API Tests

### 1. Get Available Instructors
```bash
curl -X GET http://localhost:4000/api/admin/instructors
```

Expected Response:
```json
[
  {
    "id": 1,
    "name": "Dr. John Smith",
    "department": "Computer Science"
  },
  {
    "id": 2,
    "name": "Dr. Jane Doe", 
    "department": "Computer Science"
  }
]
```

### 2. Get All Subjects
```bash
curl -X GET http://localhost:4000/api/admin/subjects
```

### 3. Create Subject with Instructor
```bash
curl -X POST http://localhost:4000/api/admin/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "course_code": "CS404",
    "course_name": "Artificial Intelligence",
    "semester": "Semester 7",
    "credits": 4,
    "course_type": "Lab Cum Theory",
    "min_lab_hours": 2,
    "min_theory_hours": 3,
    "max_capacity": 40,
    "prerequisites": "CS301, CS302",
    "instructor_id": 1
  }'
```

## Staff API Tests

### 1. Get Staff Dashboard Stats
First login as staff to get token, then:

```bash
curl -X GET http://localhost:4000/api/staff/dashboard-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Get Staff Assigned Subjects
```bash
curl -X GET http://localhost:4000/api/staff/my-subjects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Staff Schedule
```bash
curl -X GET http://localhost:4000/api/staff/schedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Authentication Testing

### Login as Admin
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Login as Staff
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "staff1", 
    "password": "staff123"
  }'
```

## Testing in Browser

1. Start both backend and frontend servers
2. Navigate to http://localhost:5173 (or frontend port)
3. Login as admin with credentials from sample data
4. Go to Admin Dashboard → Subjects
5. Create/edit subjects and assign instructors
6. Logout and login as staff
7. View Staff Dashboard to see assigned subjects

## Expected Behavior

### Admin Panel
- Should see instructor dropdown populated with staff members
- Should be able to assign/unassign instructors to subjects
- Subject list should show assigned instructor names

### Staff Panel  
- Dashboard statistics should reflect actual assigned subjects
- "My Subjects" tab should show only subjects assigned to that staff member
- Should show enrollment numbers and room assignments
- Schedule should be empty until timetable is generated