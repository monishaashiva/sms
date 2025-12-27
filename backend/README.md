# School Management System - Backend API

A complete RESTful API for managing school operations including students, teachers, attendance, grades, fees, and notifications.

## Features

- 🔐 **JWT Authentication** - Secure role-based authentication (Admin, Teacher, Parent)
- 👥 **User Management** - Complete CRUD for students, teachers, and parents
- 📊 **Attendance Tracking** - Mark and view attendance records
- 📝 **Grade Management** - Record and manage student grades
- 💰 **Fee Management** - Track fee payments and due amounts
- 📢 **Notifications** - Create and manage school notifications
- 📚 **Class Management** - Manage classes and sections
- 📈 **Reports & Analytics** - Generate various reports

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher) - Local or Atlas
- npm or yarn

## Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` file
   ```bash
   cp .env.example .env
   ```

4. **Start MongoDB** (if using local):
   ```bash
   mongod
   ```

5. **Seed the database** (optional - adds sample data):
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

Server will run on `http://localhost:5000`

## Default User Accounts

After seeding, use these credentials to login:

### Admin
- **Email**: admin@school.com
- **Password**: admin123

### Teacher
- **Email**: teacher@school.com
- **Password**: teacher123

### Parent
- **Email**: parent@school.com
- **Password**: parent123

## API Endpoints

### Authentication
```
POST   /api/auth/login          - Login user
POST   /api/auth/register       - Register new user
GET    /api/auth/me             - Get current user
POST   /api/auth/logout         - Logout user
POST   /api/auth/forgot-password - Request password reset
PUT    /api/auth/reset-password - Reset password
```

### Students
```
GET    /api/students            - Get all students
GET    /api/students/:id        - Get single student
POST   /api/students            - Create student (Admin only)
PUT    /api/students/:id        - Update student (Admin only)
DELETE /api/students/:id        - Delete student (Admin only)
GET    /api/students/:id/grades - Get student grades
GET    /api/students/:id/attendance - Get student attendance
```

### Teachers
```
GET    /api/teachers            - Get all teachers
GET    /api/teachers/:id        - Get single teacher
POST   /api/teachers            - Create teacher (Admin only)
PUT    /api/teachers/:id        - Update teacher (Admin only)
DELETE /api/teachers/:id        - Delete teacher (Admin only)
GET    /api/teachers/:id/classes - Get teacher classes
```

### Classes
```
GET    /api/classes             - Get all classes
GET    /api/classes/:id         - Get single class
POST   /api/classes             - Create class (Admin only)
PUT    /api/classes/:id         - Update class (Admin only)
DELETE /api/classes/:id         - Delete class (Admin only)
GET    /api/classes/:id/students - Get class students
```

### Attendance
```
GET    /api/attendance          - Get attendance records
POST   /api/attendance          - Mark attendance
PUT    /api/attendance/:id      - Update attendance
GET    /api/attendance/student/:id - Get student attendance
GET    /api/attendance/class/:id - Get class attendance
GET    /api/attendance/report   - Generate attendance report
```

### Grades
```
GET    /api/grades              - Get all grades
POST   /api/grades              - Add grade
PUT    /api/grades/:id          - Update grade
DELETE /api/grades/:id          - Delete grade
GET    /api/grades/student/:id  - Get student grades
GET    /api/grades/class/:id    - Get class grades
```

### Fees
```
GET    /api/fees                - Get all fee records
GET    /api/fees/:id            - Get fee record
POST   /api/fees                - Create fee record (Admin only)
PUT    /api/fees/:id            - Update fee record (Admin only)
POST   /api/fees/:id/payment    - Record payment
GET    /api/fees/student/:id    - Get student fee records
GET    /api/fees/pending        - Get pending fees
GET    /api/fees/overdue        - Get overdue fees
```

### Notifications
```
GET    /api/notifications       - Get all notifications
GET    /api/notifications/:id   - Get single notification
POST   /api/notifications       - Create notification (Admin only)
PUT    /api/notifications/:id   - Update notification (Admin only)
DELETE /api/notifications/:id   - Delete notification (Admin only)
GET    /api/notifications/recent - Get recent notifications
```

### Dashboard Stats
```
GET    /api/dashboard/admin     - Get admin dashboard stats
GET    /api/dashboard/teacher   - Get teacher dashboard stats
GET    /api/dashboard/parent    - Get parent dashboard stats
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Pagination
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database configuration
├── controllers/              # Request handlers
│   ├── authController.js
│   ├── studentController.js
│   ├── teacherController.js
│   ├── classController.js
│   ├── attendanceController.js
│   ├── gradeController.js
│   ├── feeController.js
│   ├── notificationController.js
│   └── dashboardController.js
├── middleware/               # Custom middleware
│   ├── auth.js              # Authentication middleware
│   ├── error.js             # Error handler
│   └── validate.js          # Validation middleware
├── models/                   # Database models
│   ├── User.js
│   ├── Student.js
│   ├── Teacher.js
│   ├── Class.js
│   ├── Attendance.js
│   ├── Grade.js
│   ├── Fee.js
│   └── Notification.js
├── routes/                   # API routes
│   ├── auth.js
│   ├── students.js
│   ├── teachers.js
│   ├── classes.js
│   ├── attendance.js
│   ├── grades.js
│   ├── fees.js
│   ├── notifications.js
│   └── dashboard.js
├── scripts/
│   └── seed.js              # Database seeder
├── utils/
│   ├── errorResponse.js     # Custom error class
│   └── helpers.js           # Helper functions
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── README.md
└── server.js               # Entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 30d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:8080 |

## Security Features

- 🔒 Password hashing with bcrypt
- 🎫 JWT-based authentication
- 🛡️ Helmet for security headers
- 🚦 Rate limiting to prevent abuse
- ✅ Input validation and sanitization
- 🔐 Role-based access control
- 🌐 CORS configuration

## Error Handling

The API uses a centralized error handling mechanism:
- All errors are caught and formatted consistently
- HTTP status codes are properly set
- Detailed error messages in development mode
- Generic error messages in production mode

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
