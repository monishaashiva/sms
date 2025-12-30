# School Management System (SMS 2.0) - Project Context

**Use this file to prompt any AI Agent to understand the entire project instantly.**

---

## 1. 🏗️ High-Level Overview
**Type**: Fullstack Web Application (PWA ready).
**Purpose**: Comprehensive management system for schools, handling Students, Teachers, Parents, Attendance, Grades, Fees, and Notifications.
**Current Status**: Production-Ready v1.0 (Fully functional Parent/Teacher/Admin portals).

---

## 2. 💻 Technology Stack

### Frontend (`/frontend`)
-   **Framework**: React (Vite) + TypeScript
-   **Styling**: TailwindCSS + Shadcn/UI (Radix Primitives)
-   **State/Data**: `@tanstack/react-query` (API caching), `Context API` (Auth)
-   **Routing**: `react-router-dom`
-   **Animations**: `framer-motion`
-   **Icons**: `lucide-react`

### Backend (`/backend`)
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL
-   **ORM**: Prisma (`@prisma/client`)
-   **Auth**: JWT (JSON Web Tokens) + `bcryptjs`
-   **Security**: `helmet`, `cors`, `express-rate-limit`

---

## 3. 📂 Key File Structure

```text
/sms_full
├── /backend
│   ├── /prisma
│   │   └── schema.prisma       # Database Source of Truth
│   ├── /controllers            # Logic (students, teachers, fees...)
│   ├── /routes                 # API Endpoints (/api/...)
│   ├── /middleware             # Auth & Error handling
│   ├── /scripts                # Seed & Maintenance scripts
│   └── server.js               # Entry point
│
├── /frontend
│   ├── /src
│   │   ├── /pages
│   │   │   ├── /admin          # Admin features (StudentList, FeeManagement...)
│   │   │   ├── /teacher        # Teacher features (Attendance, Grades...)
│   │   │   ├── /parent         # Parent features (Dashboard, Fees...)
│   │   │   └── LoginScreen.tsx 
│   │   ├── /components         # UI Building Blocks (Shadcn/UI)
│   │   ├── /contexts           # AuthContext (Login/Logout logic)
│   │   └── /services/api.ts    # Centralized API calls (fetch wrapper)
│   └── vite.config.ts
│
├── TEAM_SETUP.md               # Setup Guide
├── TESTING_GUIDE.md            # Manual QA Guide
└── DEPLOYMENT_GUIDE.md         # Deployment Instructions
```

---

## 4. 🗄️ Database Schema (Prisma)
The database structure is normalized and relational.

```prisma
// Core User Models
model User {
  id, email, password, role (admin|teacher|parent)
  // Relations to specific profiles:
  studentProfile, teacherProfile
}

model Student {
  id, name, rollNo, classId
  // Relations:
  attendance, grades, fees
}

model Teacher {
  id, name, subject
  // Relations:
  classes (ClassTeacher), teachingClasses
}

model Class {
  id, grade, section (e.g., "10-A")
  // Relations:
  students, classTeacher
}

// Feature Models
model Attendance {
  studentId, date, status (present|absent)
}

model Grade {
  studentId, subject, marks, examType (mid_term|final)
}

model Fee {
  studentId, amount, status (paid|pending), payments[]
}

model Notification {
  title, message, type (notice|event|holiday), recipients
}
```

---

## 5. 🔐 Authentication & Roles

**Auth Flow**:
1.  **Login**: `POST /api/auth/login` -> Returns JWT.
2.  **Storage**: JWT stored in `localStorage`.
3.  **Requests**: `Authorization: Bearer <token>` header sent with every request.
4.  **Protection**: `ProtectedRoute.tsx` checks valid token + allowed role.

**Roles**:
-   **Admin**: Full access (Manage Users, Fees, Classes, System Settings).
-   **Teacher**: Restricted access (Mark Attendance, Enter Grades, View specific Classes).
-   **Parent**: Read-only access (View own Child's stats, Pay Fees).

---

## 6. 🌐 Critical API Endpoints

| Feature | Endpoint | Method | Note |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | POST | Returns `{ token, user }` |
| **Students** | `/api/students` | GET/POST | Admin only (create) |
| **Attendance** | `/api/attendance` | POST | Teacher marks bulk attendance |
| **Grades** | `/api/grades/student/:id` | GET | Fetch report card |
| **Fees** | `/api/fees/student/:id` | GET | Fetch fee status |
| **Dashboard** | `/api/dashboard/parent` | GET | Aggregated view for parents |

---

## 7. 🚀 Scripts & Commands

-   **Start Backend**: `npm run dev` (Port 5000)
-   **Start Frontend**: `npm run dev` (Port 8080)
-   **Seed Database**: `npm run seed` (Resets DB with demo data)
-   **DB Push**: `npx prisma db push` (Sync schema to Postgres)
-   **Fix Teacher**: `node scripts/fix_teacher_data.js` (Helper script)

---

## 8. ⚠️ Deployment Config
-   **Frontend**: `VITE_API_URL` env var must point to Backend URL.
-   **Backend**: `DATABASE_URL` (Postgres connection string) and `FRONTEND_URL` (CORS) are required.

---
**End of Context**
