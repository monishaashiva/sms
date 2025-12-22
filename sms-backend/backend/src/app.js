import dashboardRoutes from "./routes/dashboard.routes.js";
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import etlRoutes from './routes/etl.routes.js';
import attendanceRoutes from './routes/attendance.etl.routes.js';
import reportRoutes from './routes/report.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get('/', (req, res) => {
  res.send('School Management Backend is running 🚀');
});

// routes
app.use('/etl', etlRoutes);
app.use('/etl', attendanceRoutes);
app.use('/reports', reportRoutes);
app.use("/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
