# School Management System (SMS)

The School Management System (SMS) is a full-stack web application designed to manage academic and administrative activities within a school environment.  
The project consists of a backend server and a frontend user interface, integrated to work together as a complete system.

---

## Prerequisites

Please ensure the following are installed on your system:

- Node.js
- npm
- PostgreSQL

---

## Project Structure

CBA SMS/
├── sms-backend/
│ └── backend/
│ └── .env.example
├── sms-frontend/
│ └── .env.example
├── .gitignore
└── README.md


---

## Backend Setup (For Checking APIs)

```bash
cd sms-backend/backend
npm install
cp .env.example .env


Configure the .env file with valid PostgreSQL credentials.

Start the backend server:
node src/app.js


The backend server runs at:
http://localhost:5000


### Frontend Setup

cd sms-frontend
npm install
cp .env.example .env
npm run dev


The frontend application runs at:
http://localhost:5173


Environment Configuration

Environment variables are managed using .env files

Sensitive configuration files are excluded from version control

.env.example files are provided to indicate required environment variables

Frontend environment variables must be prefixed with VITE_