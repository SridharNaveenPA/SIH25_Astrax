# AI Timetable Management System

A comprehensive timetable management system with role-based authentication for Admin, Staff, and Students. Built with React (Frontend) and Node.js/Express (Backend) with PostgreSQL database.

## 🚀 Features

- **Role-based Authentication**: Separate login systems for Admin, Staff, and Students
- **Admin Dashboard**: Complete management of rooms, subjects, and faculty
- **Room Management**: Add, edit, delete rooms with capacity and type information
- **Subject Management**: Manage courses with prerequisites and instructor assignments
- **Faculty Management**: Add faculty members with availability and department information
- **Protected Routes**: Secure access control based on user roles
- **Responsive Design**: Modern UI with Tailwind CSS

## 📋 Prerequisites

Before setting up the project, ensure you have the following software installed:

### Required Software:
1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
3. **pgAdmin 4** - [Download here](https://www.pgadmin.org/download/)
4. **Git** - [Download here](https://git-scm.com/downloads)

### Optional (but recommended):
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **Postman** (for API testing) - [Download here](https://www.postman.com/downloads/)

## 🗄️ Database Setup

### Step 1: Create Database
1. Open **pgAdmin 4**
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `timetable_db`
5. Click "Save"

### Step 2: Execute SQL Commands
Run the following SQL commands in pgAdmin 4 Query Tool:

```sql
-- Connect to timetable_db database first, then run these commands:

-- Update users table to add name and email columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100);

-- Create rooms table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(20) UNIQUE NOT NULL,
  building VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  room_type VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subjects table
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  credits INTEGER NOT NULL,
  prerequisites TEXT,
  instructor_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculty table
CREATE TABLE faculty (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  department VARCHAR(50),
  max_hours_per_week INTEGER DEFAULT 40,
  availability JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculty subjects junction table
CREATE TABLE faculty_subjects (
  id SERIAL PRIMARY KEY,
  faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(faculty_id, subject_id)
);

-- Insert sample admin user (if not exists)
INSERT INTO users (username, password_hash, role, name, email) 
VALUES ('admin', 'admin', 'admin', 'System Administrator', 'admin@university.edu')
ON CONFLICT (username) DO NOTHING;

-- Insert sample student user
INSERT INTO users (username, password_hash, role, name, email) 
VALUES ('student001', 'studentpass', 'student', 'John Student', 'john.student@university.edu')
ON CONFLICT (username) DO NOTHING;

-- Insert sample staff user
INSERT INTO users (username, password_hash, role, name, email) 
VALUES ('staff001', 'staffpass', 'staff', 'Dr. Jane Smith', 'jane.smith@university.edu')
ON CONFLICT (username) DO NOTHING;
```

## 🛠️ Installation & Setup

### Step 1: Clone the Repository
```bash
git clone <your-github-repo-url>
cd SIH2025
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
# Create a .env file in the backend directory with:
echo "DATABASE_URL=postgres://username:password@localhost:5432/timetable_db" > .env
echo "JWT_SECRET=your_super_secret_jwt_key_here" >> .env

# Start the backend server
npm start
```

**Note**: Replace `username` and `password` in DATABASE_URL with your PostgreSQL credentials.

### Step 3: Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend/student-timify

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

## 🌐 Access the Application

Once both servers are running:

- **Frontend**: http://localhost:5173 (or the port shown in terminal)
- **Backend API**: http://localhost:4000

## 👥 Default Login Credentials

### Admin Login
- **URL**: http://localhost:5173/admin
- **Username**: `admin`
- **Password**: `admin`

### Student Login
- **URL**: http://localhost:5173/student
- **Username**: `student001`
- **Password**: `studentpass`

### Staff Login
- **URL**: http://localhost:5173/staff
- **Username**: `staff001`
- **Password**: `staffpass`

## 📁 Project Structure

```
SIH2025/
├── backend/
│   ├── src/
│   │   ├── auth_db.js          # Authentication routes
│   │   ├── admin_routes.js     # Admin management routes
│   │   ├── server.js           # Main server file
│   │   ├── db.js              # Database connection
│   │   └── db_schema.sql      # Database schema
│   ├── package.json
│   └── .env                   # Environment variables
├── frontend/
│   └── student-timify/
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/         # UI components
│       │   │   ├── ProtectedRoute.tsx
│       │   │   ├── RoomManagement.tsx
│       │   │   ├── SubjectManagement.tsx
│       │   │   └── FacultyManagement.tsx
│       │   ├── pages/
│       │   │   ├── AdminDashboard.tsx
│       │   │   ├── AdminLogin.tsx
│       │   │   ├── StudentLogin.tsx
│       │   │   ├── StaffLogin.tsx
│       │   │   ├── StudentDashboard.tsx
│       │   │   ├── StaffDashboard.tsx
│       │   │   └── RoleSelection.tsx
│       │   └── App.tsx
│       └── package.json
└── README.md
```

## 🔧 Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgres://username:password@localhost:5432/timetable_db
JWT_SECRET=your_super_secret_jwt_key_here
PORT=4000
```

## 🚀 Available Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Frontend Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Admin Management
- `GET /api/admin/rooms` - Get all rooms
- `POST /api/admin/rooms` - Create new room
- `PUT /api/admin/rooms/:id` - Update room
- `DELETE /api/admin/rooms/:id` - Delete room

- `GET /api/admin/subjects` - Get all subjects
- `POST /api/admin/subjects` - Create new subject
- `PUT /api/admin/subjects/:id` - Update subject
- `DELETE /api/admin/subjects/:id` - Delete subject

- `GET /api/admin/faculty` - Get all faculty
- `POST /api/admin/faculty` - Create new faculty
- `PUT /api/admin/faculty/:id` - Update faculty
- `DELETE /api/admin/faculty/:id` - Delete faculty

- `GET /api/admin/instructors` - Get available instructors

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check if PostgreSQL is running
   - Verify DATABASE_URL in .env file
   - Ensure database `timetable_db` exists

2. **Port Already in Use**:
   - Change PORT in .env file
   - Kill existing processes: `npx kill-port 4000`

3. **Module Not Found Errors**:
   - Run `npm install` in both backend and frontend directories
   - Clear node_modules and reinstall if needed

4. **White Screen in Frontend**:
   - Check browser console for errors
   - Ensure backend server is running
   - Check network requests in browser dev tools

### Getting Help:
- Check browser console for error messages
- Check terminal output for server errors
- Verify all prerequisites are installed correctly

## 📝 Development Notes

- The system uses JWT tokens for authentication
- Passwords are stored as plain text (for demo purposes)
- All CRUD operations are implemented for admin management
- The frontend uses React Router for navigation
- Tailwind CSS is used for styling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🎉**

For any issues or questions, please check the troubleshooting section or create an issue in the repository.
"# SIH25_Astrax" 
