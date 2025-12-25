import dashboardRoutes from "./routes/dashboard.routes.js";
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import etlRoutes from './routes/etl.routes.js';
import attendanceEtlRoutes from './routes/attendance.etl.routes.js';
import reportRoutes from './routes/report.routes.js';
import studentRoutes from "./routes/student.routes.js";
import classRoutes from "./routes/class.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import teacherdashboardRoutes from "./routes/teacherdashboard.routes.js";
import gradesRoutes from "./routes/grades.routes.js";
import notificationsRoutes from "./routes/notifications.route.js";

import parentRoutes from "./routes/parent.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get('/', (req, res) => {
  res.send('School Management Backend is running 🚀');
});

// routes
app.use('/etl', etlRoutes);
app.use("/api/etl", attendanceEtlRoutes);
app.use('/api/reports', reportRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/teacherdashboard", teacherdashboardRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use("/api/parent", parentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
