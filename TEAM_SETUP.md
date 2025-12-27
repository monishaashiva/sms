# SMS 2.0 - Team Setup Guide

This guide describes how to set up the School Management System (Fullstack) locally.

## 📋 Prerequisites

1.  **Node.js** (v18 or higher)
2.  **PostgreSQL** (v14 or higher)
3.  **Git**

## 🚀 Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sms_full
```

### 2. Backend Setup (API & Database)

 Navigate to the backend folder:
```bash
cd backend
npm install
```

**Create a `.env` file** in the `backend/` directory.
You can simply copy the example file:
```bash
cp .env.example .env
```
Then **Edit `.env`** to match your local PostgreSQL credentials:
```ini
# Example: If your postgres password is 'root'
DATABASE_URL="postgresql://postgres:root@localhost:5432/sms_db?schema=public"
```

**Initialize Database & Schema:**
```bash
# Pushes the Prisma schema to your PostgreSQL database
npx prisma db push
```

**Seed Sample Data (Admin, Teachers, Students, Fees, Grades):**
```bash
npm run seed
```
*(You should see "✅ Database seeded successfully" in the terminal)*

**Start the Server:**
```bash
npm run dev
```

### 3. Frontend Setup (Client)

Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
```

**Start the UI:**
```bash
npm run dev
```

Access the app at: **http://localhost:8080**

## 🔑 Login Credentials

Use these accounts to test different roles:

**👨‍💼 Admin**
- Email: `admin@school.com`
- Password: `admin123`

**👩‍🏫 Teacher**
- Email: `teacher@school.com`
- Password: `teacher123`

**👨‍👩‍👧 Parent**
- Email: `parent@school.com`
- Password: `parent123`

## 🛠️ Common Issues

**1. "Authentication failed" during `prisma db push`**
- Check your `DATABASE_URL` in `.env`.
- Ensure your PostgreSQL server is running and the password is correct.
- If the database `sms_db` doesn't exist, Prisma will try to create it, but your user needs permission.

**2. "Table not found"**
- Run `npx prisma db push` again to ensure the schema is applied.

**3. "Port 5000 in use"**
- Change `PORT` in `.env` to 5001 or kill the process using port 5000.
