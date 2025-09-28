# 🎓 SIH25 Astrax - Advanced Timetable Management System

A comprehensive, intelligent timetable management system with AI-powered scheduling, role-based authentication, and complete academic management features. Built with React, Node.js, Express, and PostgreSQL.

## 🌟 Key Features

### 🔐 **Role-Based Authentication System**
- **Admin Panel**: Complete system administration and management
- **Staff Dashboard**: Personal teaching schedules and course management  
- **Student Portal**: Personalized timetables and subject enrollment

### 🤖 **Smart Timetable Generation**
- **AI-Powered Scheduling**: Intelligent constraint-based timetable generation
- **Conflict Resolution**: Automatic detection and prevention of scheduling conflicts
- **Resource Optimization**: Efficient room and instructor allocation
- **Flexible Scheduling**: Support for theory, lab, and tutorial sessions

### 📊 **Comprehensive Management**
- **Room Management**: Capacity-aware room allocation with building mapping
- **Faculty Management**: Instructor availability and subject assignments
- **Subject Management**: Course codes, credits, prerequisites, and instructor assignments
- **Student Enrollment**: Self-service subject enrollment with capacity limits
- **Credit Management**: Configurable credit limits and academic constraints

### 📈 **Advanced Features**
- **Multiple Timetable Views**: Master, Student, and Staff-specific timetables
- **CSV Export**: Professional timetable exports for all user types
- **Real-time Updates**: Live dashboard statistics and data refresh
- **Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui components

---

## � Quick Start Guide

### �📋 Prerequisites

Ensure you have the following installed:

- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12+) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

---

## 🗄️ Database Setup

### Step 1: Create Database
1. Open **pgAdmin 4** or **PostgreSQL command line**
2. Create a new database: `timetable_db`

### Step 2: Initialize Database
Execute the complete database setup script located at `database_update.sql`:

```bash
# Using psql command line:
psql -U postgres -d timetable_db -f database_update.sql

# Or copy-paste the contents of database_update.sql into pgAdmin Query Tool
```

**✅ What this script includes:**
- Complete database schema (users, rooms, subjects, faculty, timetables, etc.)
- Sample data (5 students, 10 faculty members, 7 rooms, 10 subjects)
- Student enrollments and relationships
- Indexes for performance optimization

---

## ⚡ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/SridharNaveenPA/SIH25_Astrax.git
cd SIH25_Astrax
```

### 2️⃣ Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOL
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/timetable_db
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
PORT=4000
EOL

# Start backend server
npm start
```

**🔧 Replace `your_password` with your PostgreSQL password**

### 3️⃣ Frontend Setup
```bash
# Open new terminal
cd frontend/student-timify

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🌐 Access URLs

- **🖥️ Main Application**: http://localhost:8080 (or port shown in terminal)
- **🔗 Backend API**: http://localhost:4000
- **� Responsive Design**: Works on desktop, tablet, and mobile

---

## 👥 Login Credentials

### 🛡️ **Admin Access**
- **Username**: `admin`
- **Password**: `admin123`
- **Features**: Complete system management, timetable generation, user management

### 👨‍🏫 **Staff/Faculty Access**
- **Username**: `staff_john`
- **Password**: `staff123`
- **Features**: Personal teaching schedule, subject management

### 🎓 **Student Access**
- **Username**: `student_alice`
- **Password**: `student123`
- **Features**: Personal timetable, subject enrollment, schedule downloads

**📝 Additional Test Accounts:**
- **Students**: `student_bob`, `student_charlie`, `student_diana`, `student_eve` (all with password `student123`)
- **Staff**: `staff_emily`, `staff_david`, `staff_bob` (all with password `staff123`)

---

## 🎯 User Guide

### 🛡️ **Admin Dashboard**
1. **Login** with admin credentials
2. **Navigate through tabs**:
   - **Rooms**: Add/edit/delete rooms with capacity and building info
   - **Faculty**: Manage instructor profiles and assignments
   - **Subjects**: Create courses with prerequisites and instructor assignments
   - **Credit Limits**: Set academic credit constraints
   - **Master Timetable**: Generate and manage master schedules

3. **Generate Timetable**:
   - Click "Generate Timetable" in Master Timetable tab
   - System automatically creates optimized schedule
   - Download CSV export for distribution

### 👨‍🏫 **Staff Dashboard**
1. **Login** with staff credentials
2. **View Teaching Schedule**: See your assigned classes and time slots
3. **Download Schedule**: Export personal teaching timetable as CSV
4. **Dashboard Stats**: View teaching load and schedule overview

### 🎓 **Student Dashboard**  
1. **Login** with student credentials
2. **Subject Enrollment**: Browse and enroll in available subjects
3. **My Timetable**: View personalized class schedule
4. **Download Timetable**: Export personal schedule as CSV
5. **My Subjects**: Manage enrolled courses

---

## 📁 Project Architecture

```
SIH25_Astrax/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 🔐 auth.js              # JWT authentication
│   │   ├── 🗄️ auth_db.js           # Authentication routes  
│   │   ├── 🛡️ admin_routes.js      # Admin management APIs
│   │   ├── 👨‍🏫 staff_routes.js      # Staff timetable APIs
│   │   ├── 🎓 student_routes.js    # Student enrollment APIs
│   │   ├── 🧠 timetable_generator.js # AI scheduling engine
│   │   ├── 🗄️ db.js               # Database connection
│   │   └── 🚀 server.js           # Express server
│   └── 📦 package.json
├── 📁 frontend/student-timify/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 🛡️ ProtectedRoute.tsx
│   │   │   ├── 🏢 RoomManagement.tsx
│   │   │   ├── 📚 SubjectManagement.tsx
│   │   │   ├── 👨‍🏫 FacultyManagement.tsx
│   │   │   ├── 🗓️ MasterTimetable.tsx
│   │   │   ├── 🎓 StudentTimetable.tsx
│   │   │   ├── 👨‍🏫 StaffTimetable.tsx
│   │   │   └── 📱 ui/ (shadcn components)
│   │   ├── 📁 pages/
│   │   │   ├── 🛡️ AdminDashboard.tsx
│   │   │   ├── 👨‍🏫 StaffDashboard.tsx
│   │   │   ├── 🎓 StudentDashboard.tsx
│   │   │   └── 🔐 Login pages
│   │   └── ⚛️ App.tsx
│   └── 📦 package.json
├── �️ database_update.sql         # Complete DB setup
└── 📖 README.md
```

---

## � API Reference

### 🔐 Authentication
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Current user profile

### �️ Admin APIs
- `GET /api/admin/dashboard-stats` - Dashboard statistics
- `GET|POST|PUT|DELETE /api/admin/rooms` - Room management
- `GET|POST|PUT|DELETE /api/admin/subjects` - Subject management  
- `GET|POST|PUT|DELETE /api/admin/faculty` - Faculty management
- `POST /api/admin/generate-master-timetable` - Generate schedules
- `GET /api/admin/master-timetable` - Retrieve master timetable

### 👨‍🏫 Staff APIs
- `GET /api/staff/dashboard-stats` - Teaching statistics
- `GET /api/staff/timetable` - Personal teaching schedule

### 🎓 Student APIs
- `GET /api/student/dashboard-stats` - Enrollment statistics
- `GET /api/student/available-subjects` - Available courses
- `POST /api/student/enroll/:id` - Enroll in subject
- `DELETE /api/student/drop/:id` - Drop subject
- `GET /api/student/my-subjects` - Enrolled subjects
- `GET /api/student/timetable` - Personal timetable

---

## 🧠 AI Timetable Generation

### Algorithm Features:
- **Constraint Programming**: Ensures no conflicts in scheduling
- **Resource Optimization**: Efficient allocation of rooms and instructors
- **Intelligent Distribution**: Balanced workload across days and time slots
- **Conflict Detection**: Automatic prevention of double-booking
- **Lunch Break Integration**: Built-in break periods

### Constraints Handled:
- ✅ Instructor availability conflicts
- ✅ Room capacity and type matching
- ✅ Student enrollment limits
- ✅ Time slot conflicts
- ✅ Academic credit limits

---

## � Troubleshooting

### 💥 Common Issues & Solutions

#### **Database Connection Failed**
```bash
# Check PostgreSQL service
sudo service postgresql start  # Linux/Mac
# or use Services app on Windows

# Verify database exists
psql -U postgres -l | grep timetable_db
```

#### **Port Already in Use**
```bash
# Kill processes on ports
npx kill-port 4000 8080
# Or change ports in .env and vite.config.ts
```

#### **Frontend White Screen**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### **CSV Export Issues**
- **Hard refresh**: `Ctrl + Shift + R`  
- **Clear browser cache**
- **Try incognito mode**

---

## 🚀 Production Deployment

### Backend (Node.js)
```bash
# Build and start
npm install --production
npm start

# Using PM2 for process management
npm install -g pm2
pm2 start src/server.js --name "timetable-backend"
```

### Frontend (React)
```bash
# Build for production
npm run build

# Serve with nginx or serve
npm install -g serve
serve -s dist -l 3000
```

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://user:pass@host:5432/timetable_db
JWT_SECRET=your_super_secure_production_jwt_secret
NODE_ENV=production
PORT=4000
```

---

## � Database Schema Overview

### Core Tables:
- **`users`**: Authentication and user profiles
- **`rooms`**: Physical spaces with capacity and type
- **`subjects`**: Academic courses with credits and prerequisites  
- **`faculty`**: Instructor profiles and availability
- **`student_enrollments`**: Student-subject relationships
- **`timetables`**: Generated schedule metadata
- **`timetable_slots`**: Individual time slot assignments

### Sample Data Included:
- **5 Students** with varied enrollments
- **10 Faculty Members** across departments
- **7 Rooms** with different capacities
- **10 Subjects** with realistic course structure
- **Pre-configured enrollments** for immediate testing

---

## 🤝 Contributing

### Development Setup:
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add feature: description"`
5. Push and create Pull Request

### Code Standards:
- **ESLint** for JavaScript linting
- **Prettier** for code formatting  
- **TypeScript** for frontend type safety
- **Comprehensive error handling**

---

## � License & Credits

### 🏆 Smart India Hackathon 2025

This project is developed for the **Smart India Hackathon (SIH) 2025** program - a nationwide initiative to harness the creativity and technical expertise of students to solve real-world problems.

**Problem Statement ID**: 25091  
**Problem Statement Title**: AI-Based Timetable Generation System aligned with NEP 2020 for Multidisciplinary Education Structures  
**Project Category**: Software  
**Team**: Astrax  
**Institution**: [Your Institution Name]

### 📜 Usage & Distribution

This project is created as part of an educational hackathon and is intended for:
- Academic research and learning purposes
- Non-commercial use and modification
- Demonstration of technical capabilities
- Open source contribution to the developer community
- Implementation of NEP 2020 guidelines for flexible, multidisciplinary education

**Note**: This is an open-source educational project. Contributors and users are encouraged to respect intellectual property and give appropriate credit when using or modifying this codebase.

### Development Team - Astrax
- Advanced timetable management system
- Smart Hackathon Innovation (SIH) 2025 project
- Built with modern web technologies

### Technologies Used:
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, PostgreSQL
- **Authentication**: JWT tokens
- **Styling**: Responsive design with dark/light themes

---

## 🎉 Getting Started

1. **Follow the setup guide above**
2. **Login with provided credentials**
3. **Generate a master timetable (Admin)**
4. **Explore all three user interfaces**
5. **Test CSV exports and enrollments**

**🚀 Ready to revolutionize academic scheduling!**

---

**For support, issues, or questions:**
- 📧 Create an issue in this repository
- 📖 Check the troubleshooting section above
- 🔍 Review API documentation for integration

**Happy Scheduling! 🎓✨** 
