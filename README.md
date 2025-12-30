# School Harmony - School Management System

A comprehensive, full-stack School Management System designed to bridge the gap between administrators, teachers, and parents.

## 🚀 Overview

School Harmony provides a unified platform for managing everyday school operations. From student admissions and attendance to grade tracking and fee management, the application ensures data integrity and real-time accessibility across three specialized portals.

## ✨ Key Features

### 🔐 Multi-Role Portals
- **Admin**: Complete system oversight, user management, and financial analytics.
- **Teacher**: Simplified attendance marking, grade entry, and student performance tracking.
- **Parent**: Dedicated child dashboard for viewing attendance, academic reports, and fee status.

### 📊 Powerful Management
- **Intelligent Attendance**: Real-time presence/absence tracking with period-wise breakdown.
- **Academic Performance**: Dynamic report cards with percentage calculation and subject-wise analysis.
- **Financial Tracking**: Automated fee status tracking with history and due alerts.
- **Notice Board**: Centralized communication for events and school-wide announcements.

## 💻 Tech Stack

- **Frontend**: React.js, TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/monishaashiva/sms.git
   cd sms
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file based on .env.example
   npx prisma db push
   npm run seed
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🤝 Contribution
This project was developed by our team to modernize school workflows. For any queries, please contact the maintainers.

---
**School Harmony © 2025**
