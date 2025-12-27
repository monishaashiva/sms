# 🚀 Quick Start Guide - School Management System

## ⚡ Quick Setup (5 Minutes)

### 1. Start the Backend Server

The backend is already configured and running! You should see:
```
✅ Server running in development mode
🚀 Port: 5000
✅ MongoDB Connected: localhost
```

If not running, open a new terminal and run:
```bash
cd backend
npm run dev
```

### 2. Seed the Database (Create Sample Data)

Open a **new terminal** and run:
```bash
cd backend
npm run seed
```

This creates:
- ✅ 3 User accounts (Admin, Teacher, Parent)
- ✅ Sample students
- ✅ Sample teachers  
- ✅ Classes and sections
- ✅ Attendance records
- ✅ Grade records
- ✅ Fee records
- ✅ Notifications

### 3. Frontend is Already Running

Your frontend should already be running at:
**http://localhost:8080**

If not, open a new terminal:
```bash
cd frontend
npm run dev
```

## 🔑 Login Credentials

After seeding, use these credentials to login:

### 👨‍💼 Admin Account
- **URL**: http://localhost:8080/login
- **Email**: `admin@school.com`
- **Password**: `admin123`
- **Access**: Full system management

### 👩‍🏫 Teacher Account
- **Email**: `teacher@school.com`
- **Password**: `teacher123`
- **Access**: View students, mark attendance, enter grades

### 👨‍👩‍👧 Parent Account
- **Email**: `parent@school.com`
- **Password**: `parent123`
- **Access**: View children's attendance, grades, fees

## 📱 What You Can Do Now

### As Admin
1. **Dashboard** - View school overview and statistics
2. **Students** - Add, edit, view student records
3. **Teachers** - Manage teacher profiles
4. **Classes** - Create and manage classes
5. **Attendance** - View attendance reports
6. **Grades** - View and manage grades
7. **Fees** - Track fee payments and dues
8. **Notifications** - Send announcements

### As Teacher
1. **Dashboard** - View your classes and students
2. **Students** - View assigned students
3. **Attendance** - Mark daily attendance
4. **Grades** - Enter student grades
5. **Notifications** - View school announcements

### As Parent
1. **Dashboard** - View all children's information
2. **Attendance** - Track attendance records
3. **Grades** - View academic performance
4. **Fees** - Check payment status
5. **Notifications** - Receive school updates

## 🔄 Testing the API

### Check if Backend is Working

Open your browser or use curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Get API info
curl http://localhost:5000/
```

### Test Login via API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'
```

## 📊 View Sample Data

After seeding, you'll have:
- **4 Students** across different classes
- **2 Teachers** with assigned subjects
- **3 Classes** (10-A, 10-B, 9-A)
- **7 days** of attendance records for each student
- **5 subjects** of grades for each student
- **Fee records** for all students
- **4 Notifications** (events, reminders, notices)

## 🎯 Next Steps

1. **Login** as Admin at http://localhost:8080
2. **Explore** the different sections
3. **Try** creating new students, marking attendance
4. **Test** different user roles (Admin, Teacher, Parent)
5. **Check** the API responses in browser DevTools

## 🐛 Troubleshooting

### Backend Not Starting?
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Make sure MongoDB is running
# Check the backend terminal for connection errors
```

### Frontend Not Loading?
```bash
# Clear browser cache
# Check console for errors (F12)
# Make sure frontend is running on port 8080
```

### Can't Login?
1. Make sure you ran `npm run seed` in the backend folder
2. Check backend terminal for any errors
3. Use exact credentials (case-sensitive)
4. Clear browser localStorage: `localStorage.clear()`

### Database Errors?
```bash
# MongoDB not running? 
# Option 1: Install MongoDB locally
# Option 2: Use MongoDB Atlas (cloud) - update MONGODB_URI in backend/.env
```

## 📝 Project Structure

```
sms_full/
├── frontend/          # React app (Port 8080)
│   ├── src/
│   │   ├── pages/    # All page components
│   │   ├── services/ # API integration (NEW!)
│   │   └── contexts/ # Auth context (UPDATED!)
│   └── .env          # Frontend config (NEW!)
│
└── backend/           # Node.js API (Port 5000)
    ├── models/       # Database schemas
    ├── controllers/  # Business logic
    ├── routes/       # API endpoints
    ├── scripts/      # Seed script
    └── .env          # Backend config
```

## 🌐 Important URLs

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000/api
- **API Docs**: http://localhost:5000

## 💡 Tips

1. Keep both terminals open (frontend + backend)
2. Backend will auto-reload on file changes
3. Frontend has hot-reload enabled
4. Check browser console for any errors
5. Backend logs appear in terminal

## 🎉 You're All Set!

Everything is configured and ready to use. Just:
1. Seed the database (if not done)
2. Open http://localhost:8080
3. Login with any account
4. Start exploring!

Need help? Check the main README.md file for detailed documentation.
