# Testing Instructor Dropdown Fix

## Issue
The instructor dropdown in the admin panel wasn't showing manually added staff users because the query required entries in the `faculty` table.

## Solution Applied
Updated the `/api/admin/instructors` endpoint query from:
```sql
-- Before (INNER JOIN - required faculty table entry)
SELECT u.id, u.name, f.department 
FROM users u 
JOIN faculty f ON u.id = f.user_id 
WHERE u.role = 'staff'
```

To:
```sql
-- After (LEFT JOIN - works without faculty table entry)
SELECT u.id, u.name, 
  COALESCE(f.department, 'Computer Science') as department 
FROM users u 
LEFT JOIN faculty f ON u.id = f.user_id 
WHERE u.role = 'staff'
```

## What This Means
1. **Before**: Only staff users with entries in the `faculty` table would appear
2. **After**: All staff users from the `users` table will appear, with default department "Computer Science" if no faculty record exists

## Testing Steps
1. Backend server is running with the updated query
2. Visit admin panel in your frontend application
3. Go to Subjects management
4. Click "Add New Subject" or edit an existing subject
5. The instructor dropdown should now show your manually added staff users like "Dr. Jane Smith"

## Your Current Staff Users
Based on your database screenshot:
- **staff001** (Dr. Jane Smith) should now appear in the dropdown

## Optional Enhancement
Run the SQL script `add_faculty_records.sql` in pgAdmin to create proper faculty records for your staff users with department information.