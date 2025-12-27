# School Management System - Complete Full-Stack Application

A modern, full-featured School Management System built with React (Frontend) and Node.js/Express/MongoDB (Backend).

## 🚀 Features

### For Administrators
- 📊 **Comprehensive Dashboard** - Overview of school statistics, charts, and metrics
- 👥 **Student Management** - Complete CRUD operations for student records
- 👨‍🏫 **Teacher Management** - Manage teacher profiles, assignments, and schedules
- 🏫 **Class Management** - Organize classes, sections, and subjects
- 📝 **Attendance Tracking** - Mark and monitor student attendance
- 📈 **Grade Management** - Record and analyze student grades and performance
- 💰 **Fee Management** - Track fee payments, generate receipts, handle overdue fees
- 📢 **Notifications** - Create and broadcast announcements to all stakeholders
- 📊 **Reports & Analytics** - Generate detailed reports for various metrics

### For Teachers
- 📚 **Class Overview** - View assigned classes and student lists
- ✅ **Attendance Management** - Mark daily attendance for students
- 📝 **Grade Entry** - Enter and update student grades and marks
- 📊 **Performance Tracking** - Monitor student progress and performance
- 📢 **View Notifications** - Stay updated with school announcements

### For Parents
- 👦 **Children Dashboard** - View all children's information in one place
- 📊 **Attendance Monitoring** - Track child's attendance records
- 📈 **Grade Reports** - View academic performance and grades
- 💰 **Fee Status** - Check fee payment status and history
- 📢 **Receive Notifications** - Get important updates from school

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Tanstack Query** - Data fetching and caching

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database)

## 🚀 Installation & Setup

### 1. Clone or Download the Project

```bash
cd sms_full
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
The `.env` file is already created with default values. If you want to use MongoDB Atlas or change settings:

```bash
# Edit backend/.env file
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/school_management
# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_management
JWT_SECRET=school_harmony_super_secret_jwt_key_2024_change_in_production
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:8080
```

#### Start MongoDB (if using local installation)
```bash
# On Windows, MongoDB should start automatically as a service
# Or manually start it:
mongod

# On Mac/Linux:
sudo systemctl start mongod
# or
brew services start mongodb-community
```

#### Seed the Database (Optional but Recommended)
This will create sample data including users, students, teachers, classes, etc.

```bash
npm run seed
```

You'll see login credentials after seeding:
- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123
- **Parent**: parent@school.com / parent123

#### Start the Backend Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start the Frontend Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:8080`

## 🌐 Access the Application

1. **Open your browser** and navigate to `http://localhost:8080`
2. **Login** with one of the seeded accounts:

### Admin Login
- **Email**: admin@school.com
- **Password**: admin123
- **Access**: Full system access, all management features

### Teacher Login
- **Email**: teacher@school.com
- **Password**: teacher123
- **Access**: View students, mark attendance, enter grades

### Parent Login
- **Email**: parent@school.com
- **Password**: parent123
- **Access**: View children's information, attendance, grades, fees

## 📁 Project Structure

```
sms_full/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions
│   │   ├── hooks/          # Custom React hooks
│   │   └── data/           # Static data & types
│   ├── public/             # Static assets
│   └── package.json
│
└── backend/                 # Node.js Backend
    ├── config/             # Configuration files
    ├── controllers/        # Request handlers
    ├── middleware/         # Custom middleware
    ├── models/            # Mongoose models
    ├── routes/            # API routes
    ├── scripts/           # Utility scripts (seeder)
    ├── utils/             # Helper functions
    ├── uploads/           # File uploads directory
    ├── server.js          # Entry point
    └── package.json
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication
```
POST   /auth/login          - Login user
POST   /auth/register       - Register new user
GET    /auth/me             - Get current user
PUT    /auth/updatedetails  - Update user details
PUT    /auth/updatepassword - Update password
POST   /auth/logout         - Logout user
```

### Students
```
GET    /students            - Get all students
GET    /students/:id        - Get single student
POST   /students            - Create student
PUT    /students/:id        - Update student
DELETE /students/:id        - Delete student
GET    /students/:id/grades - Get student grades
GET    /students/:id/attendance - Get student attendance
GET    /students/:id/fees   - Get student fees
```

### Teachers
```
GET    /teachers            - Get all teachers
GET    /teachers/:id        - Get single teacher
POST   /teachers            - Create teacher
PUT    /teachers/:id        - Update teacher
DELETE /teachers/:id        - Delete teacher
GET    /teachers/:id/classes - Get teacher classes
```

### Classes
```
GET    /classes             - Get all classes
GET    /classes/:id         - Get single class
POST   /classes             - Create class
PUT    /classes/:id         - Update class
DELETE /classes/:id         - Delete class
GET    /classes/:id/students - Get class students
```

### Attendance
```
GET    /attendance          - Get attendance records
POST   /attendance          - Mark attendance
PUT    /attendance/:id      - Update attendance
GET    /attendance/student/:id - Get student attendance
GET    /attendance/class/:id - Get class attendance
GET    /attendance/report   - Generate attendance report
```

### Grades
```
GET    /grades              - Get all grades
POST   /grades              - Add grade
POST   /grades/bulk         - Add multiple grades
PUT    /grades/:id          - Update grade
DELETE /grades/:id          - Delete grade
GET    /grades/student/:id  - Get student grades
GET    /grades/class/:id    - Get class grades
GET    /grades/report/:id   - Get student grade report
```

### Fees
```
GET    /fees                - Get all fee records
GET    /fees/:id            - Get fee record
POST   /fees                - Create fee record
POST   /fees/class/:id      - Create fees for entire class
PUT    /fees/:id            - Update fee record
DELETE /fees/:id            - Delete fee record
POST   /fees/:id/payment    - Record payment
POST   /fees/:id/discount   - Apply discount
GET    /fees/student/:id    - Get student fees
GET    /fees/pending        - Get pending fees
GET    /fees/overdue        - Get overdue fees
GET    /fees/report         - Fee collection report
```

### Notifications
```
GET    /notifications       - Get all notifications
GET    /notifications/:id   - Get single notification
POST   /notifications       - Create notification
PUT    /notifications/:id   - Update notification
DELETE /notifications/:id   - Delete notification
GET    /notifications/recent - Get recent notifications
PUT    /notifications/:id/read - Mark as read
GET    /notifications/unread/count - Get unread count
```

### Dashboard
```
GET    /dashboard/admin     - Admin dashboard stats
GET    /dashboard/teacher   - Teacher dashboard stats
GET    /dashboard/parent    - Parent dashboard stats
```

## 🔐 Authentication

All API requests (except login/register) require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Testing the API

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'

# Get current user (use token from login response)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all students
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Import the collection from `backend/postman_collection.json` (if available)
2. Set the base URL to `http://localhost:5000/api`
3. Add Authorization header with Bearer token

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
# Windows: It should auto-start
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use
```bash
# If port 5000 or 8080 is already in use:
# Change the port in backend/.env (PORT=5000)
# Or in frontend/vite.config.ts
```

### CORS Issues
Make sure the backend `.env` file has the correct frontend URL:
```
FRONTEND_URL=http://localhost:8080
```

## 📝 Common Tasks

### Create a New Admin User
```bash
# Use the seed script or create via API
POST /api/auth/register
{
  "name": "New Admin",
  "email": "newadmin@school.com",
  "password": "password123",
  "role": "admin"
}
```

### Reset Database
```bash
cd backend
npm run seed
```

### Build for Production

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Built files will be in frontend/dist
```

## 🎯 Next Steps

1. **Customize the branding** - Update colors, logo, school name
2. **Add more features** - Implement additional modules as needed
3. **Deploy to production** - Use services like Heroku, Vercel, or AWS
4. **Set up email notifications** - Integrate SendGrid or similar
5. **Add file upload** - Implement document management system
6. **Create mobile app** - Build React Native app using same backend

## 🤝 Support

For issues or questions:
1. Check the README files in frontend and backend folders
2. Review the API documentation
3. Check server logs for error messages

## 📄 License

This project is licensed under the MIT License.

## ✨ Features Coming Soon

- 📧 Email notifications
- 📱 SMS integration
- 📊 Advanced analytics and charts
- 📅 Calendar and event management
- 💬 Messaging system
- 📁 Document management
- 🔔 Real-time notifications
- 📱 Mobile application

---

**Enjoy managing your school with this comprehensive system! 🎓**
